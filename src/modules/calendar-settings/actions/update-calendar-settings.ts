import { updateCalendarSettings } from '../calendar-settings-service'

type Payload = {
  preferred_days_full_length_exam?: number[],
  preferred_days_section_exam?: number[],
  full_length_exam_frequency?: string,
  section_exam_frequency?: string,
  chapter_exam_delay?: number,
  preferred_days_chapters?: number[],
}

export default async (courseId: string, payload: Payload) => (
  updateCalendarSettings(courseId, payload)
)
