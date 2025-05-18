import { findBySubchapterId } from '../book-content-questions-repository'

export default async (subchapter_id: string) => (
  findBySubchapterId(subchapter_id)
)
