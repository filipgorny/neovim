import { findOneOrFail } from '../course_end_date_days-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
