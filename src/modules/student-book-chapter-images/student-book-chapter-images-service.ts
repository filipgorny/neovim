import { create } from './student-book-chapter-images-repository'

export const copyChapterImagesFromOriginalChapter = studentChapterId => async chapterImage => (
  create({
    chapter_id: studentChapterId,
    original_chapter_id: chapterImage.chapter_id,
    image: chapterImage.image,
    small_ver: chapterImage.small_ver,
    order: chapterImage.order,
  })
)
