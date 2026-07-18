// Student self-exams (exam_type "student_self_exam") are student self-assessments
// with no teacher/school. This admin audit view is for teacher-corrected exams,
// so we hide them. We also hide HPS records from the dashboard view.
// The metadata API has no exam-type or exclude-school query param, so we filter
// client-side and keep the identification tolerant of naming variations.

export function isSelfExam(item) {
  const exam = item?.exam || {};
  const type = String(exam.exam_type || "").toLowerCase();
  const teacher = String(exam.teacher_username || "").toLowerCase();
  return type.includes("self_exam") || type.includes("self exam") || teacher.includes("self_exam");
}

export function isHpsSchool(item) {
  const exam = item?.exam || {};
  const schoolCode = String(exam.school_code || "").trim().toUpperCase();
  return schoolCode === "HPS";
}

export function excludeHiddenExams(results) {
  if (!Array.isArray(results)) return [];
  return results.filter((item) => !isSelfExam(item) && !isHpsSchool(item));
}
