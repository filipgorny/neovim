import { findOneOrFail } from '../mcat-dates-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
