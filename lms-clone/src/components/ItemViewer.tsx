import { lazy, Suspense, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import {
  FileText,
  Video,
  Music,
  File,
  Play,
  Link as LinkIcon,
  HelpCircle,
  AlarmClock,
  ClipboardList,
  Code,
  ClipboardCheck,
  Maximize2,
  Minimize2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { courseApi } from "../api/courses";
import type { CourseItem } from "../context/CourseContext";

const PdfViewer = lazy(() => import("./PdfViewer").then((m) => ({ default: m.PdfViewer })));

function getYouTubeId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/,
      /youtube\.com\/embed\/([\w-]{11})/,
      /youtube\.com\/live\/([\w-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    const urlObj = new URL(url);
    const v = urlObj.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
  } catch {}
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}

function isDirectVideoUrl(url: string): boolean {
  return /^data:video\//i.test(url) || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

function isPdfUrl(url: string): boolean {
  return /^data:application\/pdf/i.test(url) || /\.pdf(\?.*)?$/i.test(url);
}

function isDocumentUrl(url: string): boolean {
  return /\.(docx?|pptx?|xlsx?|odt|ods|odp|rtf)(\?.*)?$/i.test(url);
}

function isAudioUrl(url: string): boolean {
  return /^data:audio\//i.test(url) || /\.(mp3|wav|ogg|m4a|aac|flac|wma)(\?.*)?$/i.test(url);
}

function isGoogleDocsUrl(url: string): boolean {
  return /docs\.google\.com|drive\.google\.com/i.test(url);
}

function buildGoogleDocsEmbedUrl(url: string): string {
  return url.replace(/\/edit(?:\?.*)?$/, "/preview").replace(/\/view(?:\?.*)?$/, "/preview");
}

function buildOfficeViewerUrl(url: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

function extractVideoUrlFromEmbedCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const iframeSrc = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  if (iframeSrc) return iframeSrc;

  const embedSrc = trimmed.match(/<embed[^>]+src=["']([^"']+)["']/i)?.[1];
  if (embedSrc) return embedSrc;

  return trimmed;
}

const QUIZ_ATTEMPTS_STORAGE_KEY = "lms_quiz_attempts";

function readStoredUser(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem("qt_nxt_user") || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function saveQuizAttemptLocally(payload: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    existing.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error("Failed to save quiz attempt locally", error);
  }
}

function useDirectVideoThumbnail(url: string | null) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !isDirectVideoUrl(url)) {
      setThumbnailUrl(null);
      return;
    }

    let disposed = false;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const captureFrame = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        if (!disposed) setThumbnailUrl(dataUrl);
      } catch {
        if (!disposed) setThumbnailUrl(null);
      }
    };

    const handleLoadedMetadata = () => {
      try {
        video.currentTime = Math.min(0.1, Math.max(0, (video.duration || 0) * 0.05));
      } catch {
        captureFrame();
      }
    };

    const handleSeeked = () => {
      captureFrame();
    };

    const handleError = () => {
      if (!disposed) setThumbnailUrl(null);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);

    return () => {
      disposed = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      video.src = "";
    };
  }, [url]);

  return thumbnailUrl;
}

type VideoSource =
  | { kind: "youtube"; url: string; embedUrl: string; label: string; thumbnailUrl?: string }
  | { kind: "vimeo"; url: string; embedUrl: string; label: string; thumbnailUrl?: string }
  | { kind: "direct"; url: string; label: string }
  | { kind: "iframe"; url: string; label: string };

function resolveVideoSource(url: string): VideoSource | null {
  const trimmed = extractVideoUrlFromEmbedCode(url);
  if (!trimmed) return null;

  const ytId = getYouTubeId(trimmed);
  if (ytId) {
    return {
      kind: "youtube",
      url: trimmed,
      embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`,
      label: "YouTube video preview",
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  const vimeoId = getVimeoId(trimmed);
  if (vimeoId) {
    return {
      kind: "vimeo",
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      label: "Vimeo video preview",
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
    };
  }

  if (isDirectVideoUrl(trimmed)) {
    return {
      kind: "direct",
      url: trimmed,
      label: "Video preview",
    };
  }

  return {
    kind: "iframe",
    url: trimmed,
    label: "Embedded video preview",
  };
}

type LinkSource =
  | { kind: "video"; source: VideoSource }
  | { kind: "pdf"; url: string; label: string }
  | { kind: "document"; url: string; label: string }
  | { kind: "audio"; url: string; label: string }
  | { kind: "iframe"; url: string; label: string };

type QuizAttemptContext = {
  courseId?: number;
  chapterId?: number;
  itemId?: number;
  courseTitle?: string;
  chapterTitle?: string;
  itemTitle?: string;
  itemType?: string;
  mobileNumber?: string;
};

function resolveLinkSource(url: string): LinkSource | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytId = getYouTubeId(trimmed);
  const vimeoId = getVimeoId(trimmed);
  if (ytId || vimeoId || isDirectVideoUrl(trimmed)) {
    const videoSource = resolveVideoSource(trimmed);
    if (videoSource) {
      return { kind: "video", source: videoSource };
    }
  }

  if (isPdfUrl(trimmed)) {
    return { kind: "pdf", url: trimmed, label: "PDF preview" };
  }

  if (isDocumentUrl(trimmed)) {
    return {
      kind: "document",
      url: buildOfficeViewerUrl(trimmed),
      label: "Document preview",
    };
  }

  if (isGoogleDocsUrl(trimmed)) {
    return { kind: "document", url: buildGoogleDocsEmbedUrl(trimmed), label: "Google Docs preview" };
  }

  if (isAudioUrl(trimmed)) {
    return { kind: "audio", url: trimmed, label: "Audio preview" };
  }

  return { kind: "iframe", url: trimmed, label: "Link preview" };
}

const typeIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  video: Video,
  audio: Music,
  scorm: FileText,
  file: File,
  text: FileText,
  link: LinkIcon,
  quiz: HelpCircle,
  livetest: AlarmClock,
  liveclass: Video,
  assignment: ClipboardList,
  coding: Code,
  form: ClipboardCheck,
};

function QuizViewer({
  item,
  attemptContext,
}: {
  item: CourseItem;
  attemptContext?: QuizAttemptContext;
}) {
  const questions = item.quizQuestions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [attemptSaved, setAttemptSaved] = useState(false);

  if (questions.length === 0) {
    return <Placeholder item={item} />;
  }

  const q = questions[currentIndex];
  const selectedOptId = selectedAnswers[q.id];
  const isSubmitted = submittedQuestions[q.id];
  const isCorrect = selectedOptId === q.correctOptionId;

  const handleSelectOption = (optId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [q.id]: optId });
  };

  const handleCheckAnswer = () => {
    if (!selectedOptId) return;
    setSubmittedQuestions({ ...submittedQuestions, [q.id]: true });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setCurrentIndex(0);
    setShowResults(false);
    setAttemptSaved(false);
  };

  useEffect(() => {
    if (!showResults || attemptSaved || questions.length === 0) return;

    const correctCount = questions.filter((quest) => selectedAnswers[quest.id] === quest.correctOptionId).length;
    const totalResult = Number(((correctCount / questions.length) * 100).toFixed(2));
    const storedUser = readStoredUser();
    const userIdentifier =
      String(
        attemptContext?.courseId ??
          storedUser.id ??
          storedUser.phone ??
          storedUser.mobileNumber ??
          storedUser.email ??
          storedUser.name ??
          ""
      ) || "";
    const mobileNumber = String(attemptContext?.mobileNumber ?? storedUser.phone ?? storedUser.mobileNumber ?? "");
    const profileSnapshot = Object.keys(storedUser).length > 0 ? storedUser : undefined;
    const payload = {
      courseId: attemptContext?.courseId,
      chapterId: attemptContext?.chapterId,
      itemId: attemptContext?.itemId ?? item.id,
      courseTitle: attemptContext?.courseTitle ?? "",
      chapterTitle: attemptContext?.chapterTitle ?? "",
      itemTitle: attemptContext?.itemTitle ?? item.title,
      itemType: attemptContext?.itemType ?? item.type,
      userIdentifier,
      mobileNumber,
      profileSnapshot,
      quizQuestions: questions,
      correctAnswers: questions.map((quest) => {
        const correctOption = quest.options.find((opt) => opt.id === quest.correctOptionId);
        return {
          questionId: quest.id,
          question: quest.question,
          correctOptionId: quest.correctOptionId,
          correctOptionText: correctOption?.text ?? "",
        };
      }),
      answers: questions.map((quest) => {
        const selectedOptionId = selectedAnswers[quest.id] ?? "";
        const selectedOption = quest.options.find((opt) => opt.id === selectedOptionId);
        const correctOption = quest.options.find((opt) => opt.id === quest.correctOptionId);
        return {
          questionId: quest.id,
          question: quest.question,
          selectedOptionId,
          selectedOptionText: selectedOption?.text ?? "",
          correctOptionId: quest.correctOptionId,
          correctOptionText: correctOption?.text ?? "",
          isCorrect: selectedOptionId === quest.correctOptionId,
        };
      }),
      totalQuestions: questions.length,
      correctCount,
      totalResult,
    };

    saveQuizAttemptLocally(payload);
    courseApi
      .submitQuizAttempt(payload)
      .catch((error) => {
        console.error("Failed to save quiz attempt", error);
      })
      .finally(() => {
        setAttemptSaved(true);
      });
  }, [attemptSaved, attemptContext, item.id, item.title, item.type, questions, selectedAnswers, showResults]);

  if (showResults) {
    const correctCount = questions.filter((quest) => selectedAnswers[quest.id] === quest.correctOptionId).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-[#F2F4FF] p-6 text-[#4E5DE0]">
          <HelpCircle size={48} />
        </div>
        <h3 className="text-xl font-bold text-[#0F1013]">Quiz Completed!</h3>
        <p className="text-sm text-[#6B7280]">
          You scored <span className="font-semibold text-[#0F1013]">{correctCount}</span> out of{" "}
          <span className="font-semibold text-[#0F1013]">{questions.length}</span> ({percentage}%)
        </p>
        <button
          onClick={handleRetake}
          className="bg-[#4E5DE0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4350C8]"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
        <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
        <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Completed</span>
      </div>

      <div className="w-full bg-[#ECEEEF] h-1.5 overflow-hidden">
        <div
          className="bg-[#4E5DE0] h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="border border-[#ECEEEF] bg-white p-6 shadow-sm space-y-6">
        <div>
          <h4 className="text-base font-semibold text-[#0F1013]">{q.question}</h4>
          {q.questionImage && (
            <img src={q.questionImage} alt="Question" className="mt-3 max-h-48 border border-[#ECEEEF] rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          {q.questionVideo && (
            <video src={q.questionVideo} controls className="mt-3 max-h-56 w-full border border-[#ECEEEF] rounded" />
          )}
        </div>

        <div className="space-y-3">
          {q.options.map((opt) => {
            const isSelected = selectedOptId === opt.id;
            const isThisCorrect = opt.id === q.correctOptionId;
            let optionStyle = "border-[#ECEEEF] bg-white hover:bg-[#F8F9FA]";
            if (isSubmitted) {
              if (isThisCorrect) {
                optionStyle = "border-green-500 bg-green-50 text-green-900 font-medium";
              } else if (isSelected && !isThisCorrect) {
                optionStyle = "border-red-500 bg-red-50 text-red-900 font-medium";
              }
            } else if (isSelected) {
              optionStyle = "border-[#4E5DE0] bg-[#F2F4FF] text-[#4E5DE0] font-medium";
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`flex items-center gap-3 border p-4 cursor-pointer transition-all ${optionStyle}`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center border text-xs font-bold ${
                    isSelected ? "border-[#4E5DE0] bg-[#4E5DE0] text-white" : "border-[#C9CED3] text-[#6B7280]"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-sm">{opt.text}</span>
                  {opt.image && (
                    <img src={opt.image} alt="" className="mt-2 max-h-24 border border-[#ECEEEF] rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  {opt.video && (
                    <video src={opt.video} controls className="mt-2 max-h-32 w-full border border-[#ECEEEF] rounded" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isSubmitted && q.explanation && (
          <div className={`p-4 text-xs ${isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
            <span className="font-semibold">Explanation: </span>
            {q.explanation}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[#ECEEEF]">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="border border-[#ECEEEF] px-4 py-2 text-sm font-medium text-[#393F41] disabled:opacity-40"
          >
            Previous
          </button>

          {!isSubmitted ? (
            <button
              disabled={!selectedOptId}
              onClick={handleCheckAnswer}
              className="bg-[#4E5DE0] px-6 py-2 text-sm font-semibold text-white hover:bg-[#4350C8] disabled:opacity-40"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-[#4E5DE0] px-6 py-2 text-sm font-semibold text-white hover:bg-[#4350C8]"
            >
              {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Placeholder({ item }: { item: CourseItem }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full text-center py-20">
      <FileText size={48} className="text-[#9AA1A8]" />
      <div className="text-lg font-semibold text-[#232228]">{item.title}</div>
      <p className="text-sm text-[#6B7280] max-w-md">
        No preview available for this item type.
      </p>
      {item.description && <p className="text-sm text-[#6B7280] max-w-xl">{item.description}</p>}
    </div>
  );
}

function VideoFrame({
  title,
  expanded,
  onToggleExpanded,
  onToggleFullscreen,
  isFullscreen,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  children: ReactNode;
}) {
  const frame = (
    <div
      className={
        expanded
          ? "mx-auto flex h-[min(90vh,960px)] w-full max-w-[min(96vw,1600px)] flex-col gap-3"
          : "mx-auto w-full max-w-5xl"
      }
    >
      <div
        className={
          expanded
            ? "relative flex-1 overflow-hidden border border-white/10 bg-black shadow-2xl aspect-video"
            : "relative overflow-hidden border border-[#ECEEEF] bg-black shadow-sm aspect-video"
        }
      >
        <button
          type="button"
          onClick={onToggleExpanded}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label={expanded ? "Minimize video" : "Maximize video"}
          title={expanded ? "Minimize video" : "Maximize video"}
        >
          {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="absolute right-14 top-3 z-10 inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}
        >
          <Maximize2 size={16} className={isFullscreen ? "rotate-45" : ""} />
        </button>
        {children}
      </div>
      <div className="text-center text-xs text-[#6B7280]">{title}</div>
    </div>
  );

  if (!expanded) return frame;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      {frame}
    </div>
  );
}

function PlayableVideo({
  source,
  title,
  expanded,
  onToggleExpanded,
  onToggleFullscreen,
  isFullscreen,
}: {
  source: VideoSource;
  title: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const directThumbnail = useDirectVideoThumbnail(source.kind === "direct" ? source.url : null);
  const thumbnailUrl = source.thumbnailUrl || directThumbnail || "";

  useEffect(() => {
    setIsPlaying(false);
  }, [source.url]);

  const renderPlayer = () => {
    if (source.kind === "youtube") {
      return (
        <iframe
          className="h-full w-full border-0"
          src={source.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    if (source.kind === "vimeo") {
      return (
        <iframe
          className="h-full w-full border-0"
          src={source.embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (source.kind === "direct") {
      return <video controls autoPlay src={source.url} className="h-full w-full bg-black object-contain" />;
    }

    return (
      <iframe
        src={source.url}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  };

  const renderThumbnail = () => {
    const hasThumbnail = Boolean(thumbnailUrl);

    return (
      <button
        type="button"
        onClick={() => setIsPlaying(true)}
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black text-white"
        style={{
          backgroundColor: "#0b0f19",
          backgroundImage: hasThumbnail ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <span className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
            <Play size={28} className="translate-x-0.5" fill="currentColor" />
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase">
            {hasThumbnail ? "Play video" : "Click to play"}
          </span>
          <span className="max-w-md text-xs text-white/80">{title}</span>
        </span>
      </button>
    );
  };

  return (
    <VideoFrame
      title={title}
      expanded={expanded}
      onToggleExpanded={onToggleExpanded}
      onToggleFullscreen={onToggleFullscreen}
      isFullscreen={isFullscreen}
    >
      {isPlaying ? renderPlayer() : renderThumbnail()}
    </VideoFrame>
  );
}

function LinkPreviewFrame({
  url,
  label,
  title,
}: {
  url: string;
  label: string;
  title: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc || doc.body?.innerHTML === "") {
        setLoadError(true);
      }
    } catch {
      // Cross-origin — assume it loaded (can't inspect)
    }
  }, []);

  const handleError = useCallback(() => {
    setLoadError(true);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
        <LinkIcon size={48} className="text-[#9AA1A8]" />
        <div className="text-base font-semibold text-[#232228]">{title}</div>
        <p className="text-sm text-[#6B7280] max-w-md">
          This website cannot be embedded due to security restrictions. Click below to open it in a new tab.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#4E5DE0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4350C8]"
        >
          <ExternalLink size={16} />
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F8F9FA] border border-[#ECEEEF] border-b-0">
        <LinkIcon size={13} className="text-[#4E5DE0] shrink-0" />
        <span className="text-xs text-[#6B7280] truncate flex-grow">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[#4E5DE0] hover:underline"
          title="Open in new tab"
        >
          <ExternalLink size={12} />
        </a>
      </div>
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className="flex-grow w-full border border-[#ECEEEF] border-t-0"
        style={{ minHeight: "70vh" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

export function ItemViewer({
  item,
  quizAttemptContext,
}: {
  item: CourseItem;
  quizAttemptContext?: QuizAttemptContext;
}) {
  const Icon = typeIcons[item.type] ?? FileText;
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceUrl = item.fileData || item.url || "";
  const videoSource = item.type === "video" ? resolveVideoSource(sourceUrl) : null;
  const linkSource = item.type === "link" ? resolveLinkSource(sourceUrl) : null;
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setVideoExpanded(false);
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, [item.id, sourceUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!videoExpanded && !isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVideoExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [videoExpanded, isFullscreen]);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await el.requestFullscreen?.();
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#ECEEEF]">
        <Icon size={18} className="text-[#4E5DE0] shrink-0" />
        <span className="text-base font-semibold text-[#0F1013] truncate">{item.title}</span>
        <span className="ml-auto shrink-0 bg-[#F2F4FF] px-2 py-0.5 text-xs font-medium text-[#4E5DE0] capitalize">
          {item.type}
        </span>
      </div>

      <div className="grow min-h-0 overflow-auto">
        {item.type === "text" && (
          <div className="markdown-body text-sm text-[#393F41]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description ?? ""}</ReactMarkdown>
          </div>
        )}

        {item.type === "video" && videoSource && (
          <PlayableVideo
            source={videoSource}
            title={item.title}
            expanded={videoExpanded}
            onToggleExpanded={() => setVideoExpanded((prev) => !prev)}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        )}

        {item.type === "video" && !videoSource && <Placeholder item={item} />}

        {item.type === "pdf" && sourceUrl && (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                Loading PDF...
              </div>
            }
          >
            <PdfViewer url={sourceUrl} title={item.title} />
          </Suspense>
        )}

        {item.type === "pdf" && !sourceUrl && <Placeholder item={item} />}

        {(item.type === "scorm" || item.type === "file") && sourceUrl && (
          <iframe src={sourceUrl} title={item.title} className="h-[70vh] w-full border border-[#ECEEEF]" />
        )}

        {(item.type === "scorm" || item.type === "file") && !sourceUrl && (
          <Placeholder item={item} />
        )}

        {item.type === "audio" && sourceUrl && (
          <audio controls src={sourceUrl} className="w-full" />
        )}

        {item.type === "audio" && !sourceUrl && <Placeholder item={item} />}

        {item.type === "link" && linkSource && linkSource.kind === "video" && (
          <PlayableVideo
            source={linkSource.source}
            title={item.title}
            expanded={videoExpanded}
            onToggleExpanded={() => setVideoExpanded((prev) => !prev)}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        )}

        {item.type === "link" && linkSource && linkSource.kind === "pdf" && (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                Loading PDF...
              </div>
            }
          >
            <PdfViewer url={linkSource.url} title={item.title} />
          </Suspense>
        )}

        {item.type === "link" && linkSource && linkSource.kind === "audio" && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <Music size={48} className="text-[#4E5DE0]" />
            <audio controls src={linkSource.url} className="w-full max-w-lg" />
          </div>
        )}

        {item.type === "link" && linkSource && linkSource.kind === "document" && (
          <LinkPreviewFrame url={linkSource.url} label={linkSource.label} title={item.title} />
        )}

        {item.type === "link" && linkSource && linkSource.kind === "iframe" && (
          <LinkPreviewFrame url={linkSource.url} label={linkSource.label} title={item.title} />
        )}

        {item.type === "link" && !linkSource && <Placeholder item={item} />}

        {item.type === "quiz" && (
          item.quizQuestions && item.quizQuestions.length > 0 ? (
            <QuizViewer item={item} attemptContext={quizAttemptContext} />
          ) : (
            <Placeholder item={item} />
          )
        )}

        {(item.type === "livetest" ||
          item.type === "liveclass" ||
          item.type === "assignment" ||
          item.type === "coding" ||
          item.type === "form") && <Placeholder item={item} />}
      </div>
    </div>
  );
}
