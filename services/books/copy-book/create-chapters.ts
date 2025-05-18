import * as R from 'ramda'
import { createChapter, cretateBookSubhaptersFromOriginalSubchapters } from '../../../src/modules/book-chapters/book-chapter-service'
import { findOneOrFail } from '../../../src/modules/book-chapters/book-chapter-repository'
import mapP from '../../../utils/function/mapp'
import { createAttachedExam } from '../../../src/modules/attached-exams/attached-exams-service'
import { AttachedExamTypeEnum } from '../../../src/modules/attached-exams/attached-exam-types'
import { copyChapterImages } from '../../../src/modules/book-chapter-images/book-chapter-images-service'
import forEachP from '../../../utils/function/foreachp'

export const createBookChapter = async (title: string, book_id: string, order: number, image_tab_title?: string) => (
  createChapter(title, order, book_id, undefined, image_tab_title)
)

const copyChapterExam = (chapter_id: string) => async (id: string) => (
  R.pipe(
    R.prop('exam_id'),
    async (exam_id: string) => createAttachedExam(AttachedExamTypeEnum.chapter, exam_id, chapter_id)
  )(id)
)

const copyExamAttachedToChapter = async (source_chapter_id: string, target_chapter_id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findOneOrFail({ id }, ['attached']),
    R.prop('attached'),
    R.unless(
      R.isNil,
      copyChapterExam(target_chapter_id)
    ),
  ])(source_chapter_id)
)

export const cretateBookChaptersFromOriginalChapters = (bookId) => async originalChapter => {
  const chapter = await R.pipe(
    R.juxt([
      R.prop('title'),
      R.always(bookId),
      R.prop('order'),
      R.prop('image_tab_title'),
    ]),
    R.apply(createBookChapter)
  )(originalChapter)

  await copyExamAttachedToChapter(originalChapter.id, chapter.id)

  await copyChapterImages(originalChapter.id, chapter.id)

  const originalSubchapters = R.prop('subchapters')(originalChapter)

  await forEachP(
    cretateBookSubhaptersFromOriginalSubchapters(chapter.id)
  )(originalSubchapters)

  return chapter
}
