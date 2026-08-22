import { useEffect, useState } from "react";
import {
  AlarmClock,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Code,
  File,
  FileText,
  Globe,
  HelpCircle,
  Link as LinkIcon,
  Lock,
  Music,
  PlayCircle,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCourses } from "../context/CourseContext";
import { useEnrollment } from "../context/EnrollmentContext";
import { CoursePlayerView } from "./CoursePlayerView";

const itemTypeIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  video: Video,
  audio: Music,
  scorm: FileText,
  file: File,
  heading: FileText,
  text: FileText,
  link: LinkIcon,
  quiz: HelpCircle,
  livetest: AlarmClock,
  liveclass: Video,
  assignment: ClipboardList,
  coding: Code,
  form: ClipboardCheck,
};

const covers = [
  "https://d502jbuhuh9wk.cloudfront.net/resources/images/cc3.jpg",
  "https://d502jbuhuh9wk.cloudfront.net/resources/images/cc6.jpg",
];

export function CourseLandingView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, loading } = useCourses();
  const { isEnrolled, enroll } = useEnrollment();
  const [showCheckout, setShowCheckout] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  const course = courses.find((c) => c.id === Number(courseId));

  // Expand all chapters by default so every lesson is visible/clickable
  useEffect(() => {
    if (course) setExpandedChapters(course.chapters.map((ch) => ch.id));
  }, [course?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-[#6B7280]">Loading course...</div>
      </div>
    );
  }

  if (!course) return <Navigate to="/courses" replace />;

  // Enrolled learners get full access to every chapter & item
  if (isEnrolled(course.id)) {
    return <CoursePlayerView initialItemId={pendingItemId} />;
  }

  const isFree = course.pricing?.planType === "FREE";
  const cover = course.cover ?? covers[course.id % covers.length];
  const mrp = Number(course.pricing?.mrp);
  const discount = Number(course.pricing?.price);
  const finalPrice = mrp > 0 ? Math.max(0, Math.round(mrp * (1 - discount / 100))) : 0;
  const instructor = course.instructor || "chandrahas";
  const chapterCount = course.chapters.length;
  const itemCount = course.chapters.reduce((sum, ch) => sum + ch.items.length, 0);

  const handleEnrollClick = () => {
    if (isFree) {
      enroll(course.id);
      navigate(`/courses/${course.id}/learn`);
    } else {
      setShowCheckout(true);
    }
  };

  const toggleChapter = (id: number) => {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/courses"))}
            className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-100"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-sm font-semibold text-neutral-900">{course.title}</div>
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isFree ? "bg-emerald-600 text-white" : "bg-indigo-950 text-white"
            }`}
          >
            {isFree ? "Free" : `₹${finalPrice.toLocaleString()}`}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: course details */}
        <div className="space-y-8">
          <div className="overflow-hidden border border-neutral-200 bg-white">
            <img src={cover} alt={course.title} className="aspect-video w-full object-cover" />
            <div className="space-y-3 p-6">
              <h1 className="text-2xl font-bold text-neutral-900">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                <span>
                  Instructor: <b className="text-neutral-900">{instructor}</b>
                </span>
                {course.language && (
                  <span className="inline-flex items-center gap-1">
                    <Globe size={14} /> {course.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <FileText size={14} /> {chapterCount} chapters · {itemCount} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={14} /> 0 learners
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> Full lifetime access
                </span>
              </div>
              {course.tagline && (
                <p className="text-base font-medium text-neutral-800">{course.tagline}</p>
              )}
            </div>
          </div>

          {course.description?.trim() && (
            <section className="border border-neutral-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">Description</h2>
              <div className="prose prose-sm max-w-none text-neutral-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.description}</ReactMarkdown>
              </div>
            </section>
          )}

          {/* Curriculum */}
          <section className="border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Course content</h2>
            {course.chapters.length === 0 ? (
              <p className="text-sm text-neutral-500">This course has no content yet.</p>
            ) : (
              <div className="space-y-2">
                {course.chapters.map((chapter) => {
                  const isExpanded = expandedChapters.includes(chapter.id);
                  return (
                    <div key={chapter.id} className="border border-neutral-200">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-neutral-50"
                      >
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-neutral-400 transition-transform ${
                            isExpanded ? "" : "-rotate-90"
                          }`}
                        />
                        <span className="text-sm font-semibold text-neutral-900">{chapter.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-neutral-500">
                          {chapter.items.length} lesson{chapter.items.length === 1 ? "" : "s"}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-neutral-100 px-4 py-2">
                          {chapter.items.length === 0 ? (
                            <div className="py-1.5 text-xs text-neutral-400">No lessons yet</div>
                          ) : (
                            chapter.items.map((item) => {
                              const Icon = itemTypeIcons[item.type] ?? FileText;
                              // Free course: every lesson opens directly. Paid: locked until enrollment.
                              const lessonBody = (
                                <>
                                  <Icon size={14} className="shrink-0 text-neutral-400" />
                                  <span className="truncate">{item.title}</span>
                                  {isFree ? (
                                    <PlayCircle size={14} className="ml-auto shrink-0 text-emerald-500" />
                                  ) : (
                                    <Lock size={12} className="ml-auto shrink-0 text-neutral-300" />
                                  )}
                                </>
                              );
                              return isFree ? (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setPendingItemId(item.id);
                                    enroll(course.id);
                                  }}
                                  className="flex w-full items-center gap-2 py-1.5 text-left text-sm text-neutral-600 hover:text-neutral-900"
                                  title="Open lesson"
                                >
                                  {lessonBody}
                                </button>
                              ) : (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2 py-1.5 text-sm text-neutral-600"
                                >
                                  {lessonBody}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: pricing / enroll card */}
        <aside>
          <div className="sticky top-6 space-y-4 border border-neutral-200 bg-white p-6">
            <div className="text-center">
              {isFree ? (
                <div className="text-3xl font-bold text-emerald-600">Free</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-neutral-900">
                    ₹{finalPrice.toLocaleString()}
                  </div>
                  {discount > 0 && mrp > 0 && (
                    <div className="mt-1 text-sm text-neutral-500">
                      <span className="line-through">₹{mrp.toLocaleString()}</span>
                      <span className="ml-2 font-medium text-emerald-600">{discount}% off</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleEnrollClick}
              className={`w-full px-6 py-3 text-base font-semibold text-white transition-colors ${
                isFree
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-indigo-950 hover:bg-indigo-900"
              }`}
            >
              {isFree ? "Go to course" : "Enroll"}
            </button>
            <p className="text-center text-xs text-neutral-500">
              {isFree
                ? "No payment needed — click to open the course and access all content instantly."
                : "Complete enrollment to unlock all course content."}
            </p>

            <ul className="space-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
              {[
                `${chapterCount} chapter${chapterCount === 1 ? "" : "s"}`,
                `${itemCount} lesson${itemCount === 1 ? "" : "s"}`,
                "Full lifetime access",
                "Access on mobile and web",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* Simulated checkout for paid courses */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">Complete enrollment</div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{course.title}</span>
                <span className="font-semibold text-neutral-900">₹{finalPrice.toLocaleString()}</span>
              </div>
              <p className="text-xs text-neutral-500">
                Demo checkout — no real payment is processed. Clicking pay enrolls you instantly.
              </p>
              <button
                onClick={() => {
                  enroll(course.id);
                  setShowCheckout(false);
                  navigate(`/courses/${course.id}/learn`);
                }}
                className="w-full bg-indigo-950 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-900"
              >
                Pay ₹{finalPrice.toLocaleString()} &amp; Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
