import { useRef, useState } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { FileMeta } from "../context/CourseContext";
import { courseApi, type UploadResult } from "../api/courses";
import { MarkdownEditor } from "./MarkdownEditor";

export type ItemType =
  | "pdf"
  | "video"
  | "audio"
  | "scorm"
  | "file"
  | "heading"
  | "text"
  | "link"
  | "quiz"
  | "livetest"
  | "liveclass"
  | "assignment"
  | "coding"
  | "form";

export type QuizOption = {
  id: string;
  text: string;
  image?: string;
  video?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  questionImage?: string;
  questionVideo?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
};

export type ItemSubmitData = {
  title: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  fileMeta?: FileMeta;
  fileData?: string;
  quizQuestions?: QuizQuestion[];
};

type VideoSourceType = "upload" | "youtube" | "vimeo" | "sprout" | "link" | "embed";

type ItemModalProps = {
  type: ItemType;
  onClose: () => void;
  onSubmit?: (data: ItemSubmitData) => void;
  initialData?: Partial<ItemSubmitData>;
};

const meta: Record<ItemType, { title: string; needsUpload?: boolean }> = {
  pdf: { title: "New PDF", needsUpload: true },
  video: { title: "New video", needsUpload: true },
  audio: { title: "New Audio", needsUpload: true },
  scorm: { title: "New SCORM", needsUpload: true },
  file: { title: "New File", needsUpload: true },
  heading: { title: "New heading" },
  text: { title: "New Text" },
  link: { title: "New Link" },
  quiz: { title: "New Quiz" },
  livetest: { title: "New Live test" },
  liveclass: { title: "New Live class" },
  assignment: { title: "New Assignment" },
  coding: { title: "New Coding test" },
  form: { title: "New Form" },
};

function inferVideoSourceType(initialUrl?: string, initialFileData?: string): VideoSourceType {
  const value = `${initialUrl || ""}`.trim();
  if (initialFileData) return "upload";
  if (!value) return "upload";
  if (value.includes("<iframe") || value.includes("<embed")) return "embed";
  if (/youtube\.com|youtu\.be/i.test(value)) return "youtube";
  if (/vimeo\.com/i.test(value)) return "vimeo";
  if (/sproutvideo\.com/i.test(value)) return "sprout";
  return "link";
}

const videoSourceOptions: Array<{ value: VideoSourceType; label: string }> = [
  { value: "upload", label: "Upload" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "sprout", label: "Sprout Video" },
  { value: "link", label: "Link" },
  { value: "embed", label: "Embed code" },
];

const importSources = [
  { id: "google", label: "Google Drive" },
  { id: "dropbox", label: "Dropbox" },
] as const;

type ImportSourceId = (typeof importSources)[number]["id"];

function validateVideoSource(source: VideoSourceType, value: string): string | null {
  const v = value.trim();
  if (!v) return "Please enter a video link first.";
  if (source === "youtube" && !/(youtube\.com|youtu\.be)/i.test(v)) {
    return "That doesn't look like a YouTube link.";
  }
  if (source === "vimeo" && !/vimeo\.com/i.test(v)) {
    return "That doesn't look like a Vimeo link.";
  }
  if (source === "sprout" && !/sproutvideo\.com/i.test(v)) {
    return "That doesn't look like a Sprout Video link.";
  }
  if (source === "embed" && !/<(iframe|embed)\s/i.test(v)) {
    return 'Paste a valid embed code, e.g. <iframe src="https://..."></iframe>';
  }
  return null;
}

function convertGoogleDriveLink(link: string): string | null {
  const trimmed = link.trim();
  if (!trimmed || !/drive\.google\.com/i.test(trimmed)) return null;
  const fileId =
    trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/i)?.[1] ??
    trimmed.match(/[?&]id=([\w-]+)/)?.[1];
  if (fileId) return `https://drive.google.com/file/d/${fileId}/view`;
  return trimmed;
}

function convertDropboxLink(link: string): string | null {
  const trimmed = link.trim();
  if (!trimmed || !/dropbox\.com/i.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    parsed.hostname = "dl.dropboxusercontent.com";
    parsed.searchParams.delete("dl");
    parsed.searchParams.set("raw", "1");
    return parsed.toString();
  } catch {
    return null;
  }
}

type VideoPreview = { kind: "iframe"; src: string } | { kind: "file"; src: string } | null;

function buildVideoPreview(value: string): VideoPreview {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const ytId = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  )?.[1];
  if (ytId) return { kind: "iframe", src: `https://www.youtube.com/embed/${ytId}` };

  const vimeoId = trimmed.match(/vimeo\.com\/(\d+)/i)?.[1];
  if (vimeoId) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeoId}` };

  const iframeSrc = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  if (iframeSrc) return { kind: "iframe", src: iframeSrc };

  if (/drive\.google\.com\/file\/d\//i.test(trimmed)) {
    return { kind: "iframe", src: trimmed.replace(/\/(view|edit)(?:[?#].*)?$/, "/preview") };
  }

  if (/^data:video\//i.test(trimmed) || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed)) {
    return { kind: "file", src: trimmed };
  }

  if (/^https?:\/\//i.test(trimmed)) return { kind: "iframe", src: trimmed };
  return null;
}

export function ItemModal({ type, onClose, onSubmit, initialData }: ItemModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>(
    inferVideoSourceType(initialData?.url, initialData?.fileData),
  );
  const [startDate, setStartDate] = useState(initialData?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialData?.endDate ?? "");
  const [duration, setDuration] = useState(initialData?.duration ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState<UploadResult | null>(() =>
    initialData?.fileData && initialData?.fileMeta
      ? {
          url: initialData.fileData,
          name: initialData.fileMeta.name,
          size: initialData.fileMeta.size,
          type: initialData.fileMeta.type,
        }
      : null,
  );
  const [videoError, setVideoError] = useState("");
  const [linkVerified, setLinkVerified] = useState(false);
  const [importPanel, setImportPanel] = useState<ImportSourceId | null>(null);
  const [importLink, setImportLink] = useState("");
  const [importError, setImportError] = useState("");
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    initialData?.quizQuestions ?? [
      {
        id: "1",
        question: "",
        questionImage: "",
        questionVideo: "",
        options: [
          { id: "opt_1", text: "", image: "", video: "" },
          { id: "opt_2", text: "", image: "", video: "" },
        ],
        correctOptionId: "opt_1",
        explanation: "",
      },
    ]
  );
  const [questionMediaEnabled, setQuestionMediaEnabled] = useState(() => {
    const qs = initialData?.quizQuestions;
    return qs ? qs.some((q) => q.questionImage || q.questionVideo) : false;
  });
  const [optionMediaEnabled, setOptionMediaEnabled] = useState(() => {
    const qs = initialData?.quizQuestions;
    return qs ? qs.some((q) => q.options.some((o) => o.image || o.video)) : false;
  });

  const { title: modalTitle, needsUpload } = meta[type];
  const headerTitle = initialData ? modalTitle.replace(/^New /, "Edit ") : modalTitle;
  const existingFile = initialData?.fileMeta;

  const isVideoModal = type === "video";

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadedInfo(null);
    setVideoError("");
  };

  const handleClearVideo = () => {
    setFile(null);
    setUrl("");
    setUploadedInfo(null);
    setVideoError("");
    setLinkVerified(false);
    setImportPanel(null);
    setImportLink("");
    setImportError("");
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    if (importFileInputRef.current) importFileInputRef.current.value = "";
  };

  const handleUploadClick = async () => {
    setVideoError("");
    if (videoSourceType === "upload") {
      if (!file) {
        if (uploadedInfo || existingFile) return;
        setVideoError("Choose a video file first, then click Upload.");
        videoFileInputRef.current?.click();
        return;
      }
      setUploading(true);
      try {
        const result = await courseApi.uploadFile(file);
        setUploadedInfo(result);
      } catch (err) {
        console.error("Video upload failed", err);
        setVideoError(
          err instanceof Error && err.message
            ? `Upload failed: ${err.message}`
            : "Upload failed. Please try again.",
        );
      } finally {
        setUploading(false);
      }
      return;
    }

    const error = validateVideoSource(videoSourceType, url);
    if (error) {
      setVideoError(error);
      setLinkVerified(false);
      return;
    }
    setLinkVerified(true);
  };

  const handleImportPanelToggle = (source: ImportSourceId) => {
    setImportPanel((prev) => (prev === source ? null : source));
    setImportLink("");
    setImportError("");
  };

  // Picking a file from the Drive/Dropbox panel uploads it straight into the video element
  const handleImportFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setVideoSourceType("upload");
    setImportPanel(null);
    setImportLink("");
    setImportError("");
    setVideoError("");
    setFile(picked);
    setUploading(true);
    try {
      const result = await courseApi.uploadFile(picked);
      setUploadedInfo(result);
    } catch (err) {
      console.error("Video upload failed", err);
      setVideoError(
        err instanceof Error && err.message
          ? `Upload failed: ${err.message}`
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleImportConfirm = () => {
    if (!importPanel) return;
    setImportError("");
    const converted =
      importPanel === "google" ? convertGoogleDriveLink(importLink) : convertDropboxLink(importLink);
    if (!converted) {
      setImportError(
        importPanel === "google"
          ? "Paste a valid Google Drive share link (Right-click file → Share → Copy link)."
          : "Paste a valid Dropbox share link (Share → Copy link).",
      );
      return;
    }
    setUrl(converted);
    setVideoSourceType("link");
    setLinkVerified(true);
    setVideoError("");
    setImportPanel(null);
    setImportLink("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileData: string | undefined;
    let fileMeta: FileMeta | undefined = existingFile;

    if (isVideoModal) {
      if (videoSourceType === "upload") {
        if (file && !uploadedInfo) {
          setVideoError('Click "Upload" to upload the selected file before submitting.');
          return;
        }
        if (uploadedInfo) {
          fileData = uploadedInfo.url;
          fileMeta = { name: uploadedInfo.name, size: uploadedInfo.size, type: uploadedInfo.type };
        } else if (existingFile) {
          fileData = initialData?.fileData;
          fileMeta = existingFile;
        } else {
          setVideoError("Choose a video file and upload it before submitting.");
          return;
        }
      } else {
        const error = validateVideoSource(videoSourceType, url);
        if (error) {
          setVideoError(error);
          return;
        }
        fileData = undefined;
        fileMeta = undefined;
      }
    } else if (file) {
      try {
        const result = await courseApi.uploadFile(file);
        fileData = result.url;
        fileMeta = { name: result.name, size: result.size, type: result.type };
      } catch (err) {
        console.error("File upload failed", err);
      }
    }

    // The video modal has no visible title field, so derive one when it is empty
    const resolvedTitle =
      title.trim() ||
      (isVideoModal
        ? videoSourceType === "upload"
          ? (uploadedInfo?.name ?? existingFile?.name ?? file?.name ?? "Video lesson").replace(
              /\.[^.]+$/,
              "",
            )
          : "Video lesson"
        : "");

    onSubmit?.({
      title: resolvedTitle,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      duration: duration || undefined,
      fileMeta,
      fileData,
      quizQuestions: type === "quiz" ? quizQuestions : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full bg-white shadow-xl overflow-hidden flex flex-col ${
          isVideoModal
            ? "max-w-[min(94vw,1280px)] min-h-[480px] max-h-[90vh]"
            : "max-w-lg max-h-[90vh]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#ECEEEF] px-6 py-4">
          <div className="text-[30px] font-medium tracking-[-0.02em] text-[#5B6474]">{headerTitle}</div>
          <button onClick={onClose} className="text-[#9AA1A8] hover:text-[#393F41]" aria-label="Close">
            <X size={30} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto">
          <div className={`p-6 flex-grow ${isVideoModal ? "space-y-8" : "space-y-4"}`}>
            {/* Title */}
            <div className={isVideoModal ? "hidden" : ""}>
              <label className="block text-sm font-medium text-[#0F1013] mb-1.5">Title *</label>
              <input
                type="text"
                required={!isVideoModal}
                className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                placeholder={needsUpload ? `${meta[type].title} title` : "Enter title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {isVideoModal ? (
              <div className="space-y-7">
                <div>
                  <div className="flex flex-wrap items-center gap-6 border-b border-[#ECEEEF] pb-4">
                    {videoSourceOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer text-[#5B6474]">
                        <input
                          type="radio"
                          name="video-source"
                          className="h-5 w-5 accent-[#1F2E75]"
                          checked={videoSourceType === option.value}
                          onChange={() => {
                            setVideoSourceType(option.value);
                            setVideoError("");
                            setLinkVerified(false);
                            setImportPanel(null);
                          }}
                        />
                        <span className="text-[15px]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_230px] xl:items-start">
                  <div className="space-y-6">
                    {videoSourceType === "upload" ? (
                      <div className="flex h-[58px] items-center border border-[#D7D9E1] bg-white px-3">
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          className="inline-flex h-full items-center rounded-[2px] border border-[#888] bg-[#F3F3F3] px-3 text-[18px] text-[#222] hover:bg-[#E8E8E8]"
                        >
                          Choose File
                        </button>
                        <span className="ml-3 text-[16px] text-[#5B6474] truncate">
                          {file
                            ? file.name
                            : uploadedInfo
                              ? `Uploaded: ${uploadedInfo.name}`
                              : existingFile
                                ? `Already uploaded: ${existingFile.name}`
                                : "No file chosen"}
                        </span>
                      </div>
                    ) : videoSourceType === "embed" ? (
                      <textarea
                        rows={5}
                        className="w-full border border-[#D7D9E1] px-4 py-3 text-base text-[#393F41] outline-none focus:border-[#4E5DE0] resize-none"
                        placeholder='<iframe src="https://..."></iframe>'
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          setLinkVerified(false);
                          setVideoError("");
                        }}
                      />
                    ) : (
                      <input
                        type="url"
                        className="w-full border border-[#D7D9E1] px-4 py-3 text-base text-[#393F41] outline-none focus:border-[#4E5DE0]"
                        placeholder={
                          videoSourceType === "youtube"
                            ? "Paste a YouTube link"
                            : videoSourceType === "vimeo"
                              ? "Paste a Vimeo link"
                              : videoSourceType === "sprout"
                                ? "Paste a Sprout Video link"
                                : "Paste a video link"
                        }
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          setLinkVerified(false);
                          setVideoError("");
                        }}
                      />
                    )}

                    {/* Single hidden input shared by Choose File + Beta uploader */}
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoFileChange}
                    />

                    {(videoError || (uploadedInfo && videoSourceType === "upload")) && (
                      <p
                        className={`flex items-center gap-1.5 text-sm ${
                          videoError ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {videoError ? (
                          <AlertCircle size={15} className="shrink-0" />
                        ) : (
                          <CheckCircle2 size={15} className="shrink-0" />
                        )}
                        {videoError ||
                          `"${uploadedInfo?.name}" uploaded successfully. Click Submit below to save.`}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[#5B62D0]">
                      <span className="inline-flex items-center rounded-full bg-[#6267DF] px-2 py-0.5 text-[12px] font-bold text-white">
                        NEW
                      </span>
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="text-[20px] leading-none font-normal hover:underline"
                      >
                        Try New Video Uploader (Beta)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2 xl:pt-9">
                    <button
                      type="button"
                      className="border border-[#D7D9E1] bg-white px-4 py-3 text-[18px] text-[#393F41] hover:bg-[#F7F9FA] whitespace-nowrap"
                      onClick={handleClearVideo}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={handleUploadClick}
                      className="inline-flex items-center gap-2 bg-[#1D2C77] px-5 py-3 text-[18px] font-semibold text-white hover:bg-[#152360] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploading && <Loader2 size={18} className="animate-spin" />}
                      {uploading
                        ? "Uploading…"
                        : videoSourceType === "upload" && (uploadedInfo || existingFile)
                          ? "Uploaded ✓"
                          : "Upload"}
                    </button>
                  </div>
                </div>

                {/* Live preview of the configured video source */}
                {(() => {
                  const previewSource =
                    videoSourceType === "upload"
                      ? (uploadedInfo?.url ?? initialData?.fileData ?? "")
                      : url;
                  const preview = buildVideoPreview(previewSource);
                  if (!preview) return null;
                  return (
                    <div className="border border-[#ECEEEF] bg-black p-2">
                      {preview.kind === "file" ? (
                        <video src={preview.src} controls className="max-h-[320px] w-full" />
                      ) : (
                        <iframe
                          src={preview.src}
                          title="Video preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="aspect-video w-full"
                        />
                      )}
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <div className="text-[16px] uppercase tracking-[0.12em] text-[#B6B8C2]">
                    OR IMPORT FROM
                  </div>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-3">
                    {importSources.map((source) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => handleImportPanelToggle(source.id)}
                        className={`inline-flex items-center gap-2 border px-4 py-3 text-[18px] whitespace-nowrap ${
                          importPanel === source.id
                            ? "border-[#4E5DE0] bg-[#F2F4FF] text-[#4E5DE0]"
                            : "border-[#D7D9E1] bg-white text-[#5B6474] hover:bg-[#F7F9FA]"
                        }`}
                      >
                        {source.label}
                      </button>
                    ))}
                  </div>

                  {importPanel && (
                    <div className="w-full max-w-xl space-y-3 border border-[#ECEEEF] bg-[#F8F9FA] p-4">
                      <div className="text-sm font-semibold text-[#393F41]">
                        Import from {importPanel === "google" ? "Google Drive" : "Dropbox"}
                      </div>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => importFileInputRef.current?.click()}
                        className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-[#4E5DE0] bg-white px-4 py-4 text-sm font-semibold text-[#4E5DE0] hover:bg-[#F2F4FF] disabled:opacity-60"
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Select file from {importPanel === "google" ? "Google Drive" : "Dropbox"}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-[#6B7280]">
                        Click "Select file", choose your video, and it is uploaded into the video
                        element directly. You can also paste a share link below.
                      </p>
                      {/* Hidden input used by the Drive/Dropbox select-file button */}
                      <input
                        ref={importFileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleImportFileSelected}
                      />
                      <div className="flex gap-2">
                        <input
                          type="url"
                          className="w-full border border-[#C9CED3] bg-white px-3 py-2 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                          placeholder={
                            importPanel === "google"
                              ? "Or paste a Google Drive share link…"
                              : "Or paste a Dropbox share link…"
                          }
                          value={importLink}
                          onChange={(e) => {
                            setImportLink(e.target.value);
                            setImportError("");
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleImportConfirm}
                          className="shrink-0 bg-[#4E5DE0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4350C8]"
                        >
                          Import
                        </button>
                      </div>
                      {importError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle size={13} className="shrink-0" />
                          {importError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {needsUpload && (
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">
                      Upload {type.toUpperCase()} file *
                    </label>
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#C9CED3] bg-[#F8F9FA] px-4 py-8 cursor-pointer hover:border-[#4E5DE0]">
                      <Upload size={24} className="text-[#9AA1A8]" />
                      <span className="text-sm text-[#393F41] font-medium">
                        {file
                          ? file.name
                          : existingFile
                            ? `Already uploaded: ${existingFile.name}`
                            : "Click to browse or drag & drop"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}

                {type === "pdf" && (
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">
                      PDF URL
                    </label>
                    <input
                      type="url"
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      placeholder="https://example.com/file.pdf"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-[#6B7280]">
                      Optional. You can upload a PDF file or paste a direct PDF URL.
                    </p>
                  </div>
                )}

                {type === "link" && (
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">URL *</label>
                    <input
                      type="url"
                      required
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-[#6B7280]">
                      Links to videos, PDFs, and common document files will open in the right-side preview when possible.
                    </p>
                  </div>
                )}

                {type === "quiz" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#0F1013]">Quiz Questions</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = Date.now().toString();
                      const newOptId1 = `opt_${Date.now()}_1`;
                      const newOptId2 = `opt_${Date.now()}_2`;
                      setQuizQuestions([
                        ...quizQuestions,
                        {
                          id: newId,
                          question: "",
                          questionImage: "",
                          questionVideo: "",
                          options: [
                            { id: newOptId1, text: "", image: "", video: "" },
                            { id: newOptId2, text: "", image: "", video: "" },
                          ],
                          correctOptionId: newOptId1,
                          explanation: "",
                        },
                      ]);
                    }}
                    className="bg-[#F2F4FF] px-3 py-1.5 text-xs font-semibold text-[#4E5DE0] hover:bg-[#E8ECFF]"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-[#F8F9FA] border border-[#ECEEEF]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${questionMediaEnabled ? 'bg-[#4E5DE0]' : 'bg-[#C9CED3]'}`}
                      onClick={() => setQuestionMediaEnabled(!questionMediaEnabled)}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${questionMediaEnabled ? 'translate-x-5' : ''}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#393F41]">Question Images/Videos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${optionMediaEnabled ? 'bg-[#4E5DE0]' : 'bg-[#C9CED3]'}`}
                      onClick={() => setOptionMediaEnabled(!optionMediaEnabled)}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${optionMediaEnabled ? 'translate-x-5' : ''}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#393F41]">Option Images/Videos</span>
                  </label>
                </div>

                {quizQuestions.map((q, qIndex) => (
                  <div key={q.id} className="border border-[#ECEEEF] bg-[#F8F9FA] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#393F41]">Question {qIndex + 1}</span>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizQuestions(quizQuestions.filter((item) => item.id !== q.id))}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        className="w-full border border-[#C9CED3] bg-white px-3 py-2 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                        placeholder="Enter question text..."
                        value={q.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizQuestions(
                            quizQuestions.map((item) => (item.id === q.id ? { ...item, question: val } : item))
                          );
                        }}
                      />
                    </div>

                    {questionMediaEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="url"
                            className="w-full border border-[#C9CED3] bg-white px-3 py-1.5 text-xs text-[#393F41] outline-none focus:border-[#4E5DE0]"
                            placeholder="Question image URL (optional)"
                            value={q.questionImage ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuizQuestions(
                                quizQuestions.map((item) => (item.id === q.id ? { ...item, questionImage: val } : item))
                              );
                            }}
                          />
                          {(q.questionImage ?? "") && (
                            <img src={q.questionImage} alt="" className="mt-1.5 max-h-24 border border-[#ECEEEF]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                        </div>
                        <div>
                          <input
                            type="url"
                            className="w-full border border-[#C9CED3] bg-white px-3 py-1.5 text-xs text-[#393F41] outline-none focus:border-[#4E5DE0]"
                            placeholder="Question video URL (optional)"
                            value={q.questionVideo ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuizQuestions(
                                quizQuestions.map((item) => (item.id === q.id ? { ...item, questionVideo: val } : item))
                              );
                            }}
                          />
                          {(q.questionVideo ?? "") && (
                            <video src={q.questionVideo} controls className="mt-1.5 max-h-28 w-full border border-[#ECEEEF]" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#6B7280]">Options (Select the correct answer)</label>
                      {q.options.map((opt, optIndex) => (
                        <div key={opt.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctOptionId === opt.id}
                              onChange={() => {
                                setQuizQuestions(
                                  quizQuestions.map((item) =>
                                    item.id === q.id ? { ...item, correctOptionId: opt.id } : item
                                  )
                                );
                              }}
                              className="accent-[#4E5DE0]"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              required
                              className="flex-grow border border-[#C9CED3] bg-white px-3 py-1.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                              placeholder={`Option ${optIndex + 1}`}
                              value={opt.text}
                              onChange={(e) => {
                                const text = e.target.value;
                                setQuizQuestions(
                                  quizQuestions.map((item) =>
                                    item.id === q.id
                                      ? {
                                          ...item,
                                          options: item.options.map((o) => (o.id === opt.id ? { ...o, text } : o)),
                                        }
                                      : item
                                  )
                                );
                              }}
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOpts = q.options.filter((o) => o.id !== opt.id);
                                  let newCorrect = q.correctOptionId;
                                  if (q.correctOptionId === opt.id) {
                                    newCorrect = newOpts[0]?.id ?? "";
                                  }
                                  setQuizQuestions(
                                    quizQuestions.map((item) =>
                                      item.id === q.id ? { ...item, options: newOpts, correctOptionId: newCorrect } : item
                                    )
                                  );
                                }}
                                className="text-xs text-[#9AA1A8] hover:text-red-600 px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {optionMediaEnabled && (
                            <div className="grid grid-cols-2 gap-2 pl-7">
                              <input
                                type="url"
                                className="w-full border border-[#C9CED3] bg-white px-2 py-1 text-[11px] text-[#393F41] outline-none focus:border-[#4E5DE0]"
                                placeholder="Image URL"
                                value={opt.image ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuizQuestions(
                                    quizQuestions.map((item) =>
                                      item.id === q.id
                                        ? { ...item, options: item.options.map((o) => (o.id === opt.id ? { ...o, image: val } : o)) }
                                        : item
                                    )
                                  );
                                }}
                              />
                              <input
                                type="url"
                                className="w-full border border-[#C9CED3] bg-white px-2 py-1 text-[11px] text-[#393F41] outline-none focus:border-[#4E5DE0]"
                                placeholder="Video URL"
                                value={opt.video ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuizQuestions(
                                    quizQuestions.map((item) =>
                                      item.id === q.id
                                        ? { ...item, options: item.options.map((o) => (o.id === opt.id ? { ...o, video: val } : o)) }
                                        : item
                                    )
                                  );
                                }}
                              />
                              {(opt.image ?? "") && (
                                <img src={opt.image} alt="" className="col-span-2 max-h-16 border border-[#ECEEEF]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              )}
                              {(opt.video ?? "") && (
                                <video src={opt.video} controls className="col-span-2 max-h-20 w-full border border-[#ECEEEF]" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptId = `opt_${Date.now()}_${q.options.length + 1}`;
                            setQuizQuestions(
                              quizQuestions.map((item) =>
                                item.id === q.id
                                  ? { ...item, options: [...item.options, { id: newOptId, text: "", image: "", video: "" }] }
                                  : item
                              )
                            );
                          }}
                          className="text-xs font-medium text-[#4E5DE0] hover:underline mt-1 block"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#C9CED3] bg-white px-3 py-1.5 text-xs text-[#393F41] outline-none focus:border-[#4E5DE0]"
                        placeholder="Explanation (optional, shown after answering)..."
                        value={q.explanation ?? ""}
                        onChange={(e) => {
                          const explanation = e.target.value;
                          setQuizQuestions(
                            quizQuestions.map((item) => (item.id === q.id ? { ...item, explanation } : item))
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
                )}

                {(type === "text" || type === "assignment" || type === "coding" || type === "form") && (
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">Description *</label>
                    {type === "text" ? (
                      <MarkdownEditor
                        value={description}
                        onChange={setDescription}
                        required
                        minHeight={120}
                        placeholder="Write your notes/content in Markdown..."
                      />
                    ) : (
                      <textarea
                        required
                        rows={4}
                        className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0] resize-none"
                        placeholder={
                          type === "assignment"
                            ? "Write assignment instructions for learners..."
                            : type === "coding"
                              ? "Describe the coding problem learners will solve..."
                              : "Describe the form / what information you want to collect..."
                        }
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {type === "livetest" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">Start date & time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">End date & time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Learners can attempt it during the specified time window. Results visible post declaration.
                </p>
              </>
                )}

                {type === "liveclass" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">Date & time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1013] mb-1.5">Duration (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-[#C9CED3] px-3 py-2.5 text-sm text-[#393F41] outline-none focus:border-[#4E5DE0]"
                      placeholder="60"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#6B7280]">Conduct live classes and webinars with your learners.</p>
              </>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#ECEEEF] bg-white">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-[#4E5DE0] px-3 py-2 hover:bg-[#F7F9FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#4E5DE0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4350C8]"
            >
              {initialData ? "Save changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
