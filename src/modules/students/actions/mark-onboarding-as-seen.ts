import { markOnboardingAsSeen } from '../student-service'

export default async (student) => (
  markOnboardingAsSeen(student.id)
)
