import { findOneOrFail } from '../admin-courses-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
