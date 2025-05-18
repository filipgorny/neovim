import { findOneOrFail } from '../course-tutors-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
