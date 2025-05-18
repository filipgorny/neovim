export type UpdateCoursePayload = {
  title: string,
  external_id?: string,
  exam_retakes_enabled?: boolean,
  codename?: string,
  max_exam_completions?: number,
}
