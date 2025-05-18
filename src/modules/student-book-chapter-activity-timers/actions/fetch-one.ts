import { findOneOrFail } from '../student-book-chapter-activity-timers-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
