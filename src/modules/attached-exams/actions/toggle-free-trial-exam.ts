import { toggleFreeTrialExam } from '../attached-exams-service'

export default async (course_id: string, exam_id: string) => (
  toggleFreeTrialExam(course_id, exam_id)
)
