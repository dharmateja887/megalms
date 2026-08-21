import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "lms_enrolled_course_ids";

function loadEnrolledIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === "number");
    }
  } catch {}
  return [];
}

type EnrollmentContextValue = {
  enrolledCourseIds: number[];
  isEnrolled: (courseId: number) => boolean;
  enroll: (courseId: number) => void;
};

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>(loadEnrolledIds);

  const enroll = useCallback((courseId: number) => {
    setEnrolledCourseIds((prev) => {
      if (prev.includes(courseId)) return prev;
      const next = [...prev, courseId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      enrolledCourseIds,
      isEnrolled: (courseId: number) => enrolledCourseIds.includes(courseId),
      enroll,
    }),
    [enrolledCourseIds, enroll],
  );

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) throw new Error("useEnrollment must be used within EnrollmentProvider");
  return ctx;
}
