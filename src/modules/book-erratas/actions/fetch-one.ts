import { findOneOrFail } from '../book-erratas-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
