import { findOneOrFail } from '../book-repository'

export default async (id: string) => (
  findOneOrFail({ id }, ['chapters.subchapters.contents'])
)
