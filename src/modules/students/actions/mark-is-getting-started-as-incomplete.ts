import { markGettingStartedAsIncomplete } from '../student-service'

export default async (student) => (
  markGettingStartedAsIncomplete(student.id)
)
