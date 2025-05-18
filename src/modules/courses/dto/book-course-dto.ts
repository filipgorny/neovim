export type CourseDTO = {
  title: string,
  external_id: string,
  course_topics_title?: string,
  logo_url?: string,
  codename?: string,
  max_exam_completions?: number,
  is_calendar_enabled?: boolean,
  dashboard_settings?: object,
}

export const makeDTO = (title: string, external_id: string, codename: string, max_exam_completions: number, logo_url?: string, is_calendar_enabled?: boolean, dashboard_settings?: object) => ({
  title,
  external_id,
  codename,
  max_exam_completions,
  logo_url,
  is_calendar_enabled,
  dashboard_settings,
})

export default CourseDTO
