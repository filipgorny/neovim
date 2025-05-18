import { findOneOrFail } from '../book-admins-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
