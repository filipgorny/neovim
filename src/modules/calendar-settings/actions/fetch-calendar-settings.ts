import { findOneOrFail } from '../calendar-settings-repository'

export default async (course_id: string) => (
  findOneOrFail({ course_id })
)
