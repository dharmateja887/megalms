import { useState } from "react";
import { X, Upload } from "lucide-react";
import type { FileMeta } from "../context/CourseContext";
import { courseApi } from "../api/courses";
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
  { label: "Google Drive", url: "https://drive.google.com" },
  { label: "Dropbox", url: "https://www.dropbox.com" },
];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileData: string | undefined;
    let fileMeta: FileMeta | undefined = existingFile;
    if (type === "video" && videoSourceType !== "upload") {
      fileData = undefined;
      fileMeta = undefined;
    }

    if (type === "video" && videoSourceType === "upload" && file) {
      try {
        const result = await courseApi.uploadFile(file);
        fileData = result.url;
        fileMeta = { name: result.name, size: result.size, type: result.type };
      } catch (err) {
        console.error("File upload failed", err);
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
    const resolvedFileData =
      fileData !== undefined
        ? fileData
        : type === "video" && videoSourceType !== "upload"
          ? undefined
          : initialData?.fileData;

    onSubmit?.({
      title: title.trim(),
      description: description.trim() || undefined,
      url: type === "video" && videoSourceType === "upload" ? (url.trim() || undefined) : url.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      duration: duration || undefined,
      fileMeta,
      fileData: resolvedFileData,
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
                required
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
                          onChange={() => setVideoSourceType(option.value)}
                        />
                        <span className="text-[15px]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_230px] xl:items-start">
                  <div className="space-y-6">
                    {videoSourceType === "upload" ? (
                      <label className="flex h-[58px] items-center border border-[#D7D9E1] bg-white px-3 cursor-pointer">
                        <span className="inline-flex h-full items-center rounded-[2px] border border-[#888] bg-[#F3F3F3] px-3 text-[18px] text-[#222]">
                          Choose File
                        </span>
                        <span className="ml-3 text-[16px] text-[#5B6474]">
                          {file
                            ? file.name
                            : existingFile
                              ? `Already uploaded: ${existingFile.name}`
                              : "No file chosen"}
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    ) : videoSourceType === "embed" ? (
                      <textarea
                        rows={5}
                        className="w-full border border-[#D7D9E1] px-4 py-3 text-base text-[#393F41] outline-none focus:border-[#4E5DE0] resize-none"
                        placeholder='<iframe src="https://..."></iframe>'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
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
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    )}

                    <div className="flex items-center gap-2 text-[#5B62D0]">
                      <span className="inline-flex items-center rounded-full bg-[#6267DF] px-2 py-0.5 text-[12px] font-bold text-white">
                        NEW
                      </span>
                      <button type="button" className="text-[20px] leading-none font-normal hover:underline">
                        Try New Video Uploader (Beta)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2 xl:pt-9">
                    <button
                      type="button"
                      className="border border-[#D7D9E1] bg-white px-4 py-3 text-[18px] text-[#393F41] hover:bg-[#F7F9FA] whitespace-nowrap"
                      onClick={() => {
                        setFile(null);
                        setUrl("");
                      }}
                    >
                      Clear
                    </button>
                    <button type="submit" className="bg-[#1D2C77] px-5 py-3 text-[18px] font-semibold text-white hover:bg-[#152360] whitespace-nowrap">
                      Upload
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <div className="text-[16px] uppercase tracking-[0.12em] text-[#B6B8C2]">
                    OR IMPORT FROM
                  </div>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="flex items-center justify-center gap-3">
                  {importSources.map((source) => (
                    <button
                      key={source.label}
                      type="button"
                      onClick={() => window.open(source.url, "_blank")}
                      className="inline-flex items-center gap-2 border border-[#D7D9E1] bg-white px-4 py-3 text-[18px] text-[#5B6474] hover:bg-[#F7F9FA] whitespace-nowrap"
                    >
                      {source.label}
                    </button>
                  ))}
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
