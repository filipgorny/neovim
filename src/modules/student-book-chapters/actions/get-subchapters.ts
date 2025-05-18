import { findOneOrFail } from '../student-book-chapter-repository'

export default async (student_book_chapter_id: string) => {
  const chapter = await findOneOrFail({ id: student_book_chapter_id }, ['subchapters'])

  return chapter.subchapters
    .filter(subchapter => !subchapter.title?.toLowerCase().includes('deleted'))
    .sort((a, b) => a.order - b.order)
}
