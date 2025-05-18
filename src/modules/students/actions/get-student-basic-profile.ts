import { findOneOrFail } from '../student-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
