import { deleteChapter } from '../book-chapter-service'

export default async (id: string) => (
  deleteChapter(true)(id)
)
