import { findOneOrFail } from '../course-topics-repository'

export default async (course_id: string, id: string) => (
  findOneOrFail({ id, course_id })
)
