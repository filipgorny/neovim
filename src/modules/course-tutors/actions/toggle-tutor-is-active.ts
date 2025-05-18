import { toggleTutorIsActive } from '../course-tutors-service'

export default async (id: string) => (
  toggleTutorIsActive(id)
)
