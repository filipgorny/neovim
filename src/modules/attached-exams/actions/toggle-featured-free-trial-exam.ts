import { toggleFeaturedFreeTrialExam } from '../attached-exams-service'

export default async (courseId, examId) => (
  toggleFeaturedFreeTrialExam(courseId, examId)
)
