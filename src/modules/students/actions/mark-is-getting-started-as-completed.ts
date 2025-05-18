import { markGettingStartedAsCompleted } from '../student-service'

export default async (student) => (
  markGettingStartedAsCompleted(student.id)
)
