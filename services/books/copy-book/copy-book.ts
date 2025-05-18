import * as R from 'ramda'
import { findBookForSync, findOneOrFail } from '../../../src/modules/books/book-repository'
import { notFoundException, throwException } from '../../../utils/error/error-factory'
import { createBookFromOriginal } from './create-book'
import { cretateBookChaptersFromOriginalChapters } from './create-chapters'
import { createAttachedExam } from '../../../src/modules/attached-exams/attached-exams-service'
import { AttachedExamTypeEnum } from '../../../src/modules/attached-exams/attached-exam-types'
import forEachP from '../../../utils/function/foreachp'
import { find as findErratas } from '../../../src/modules/book-erratas/book-erratas-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { findBookChapterIdByPath, findBookContentIdByPath, findBookSubchapterIdByPath, findPathByBookChapterId, findPathByBookContentId, findPathByBookSubchapterId } from './book-path-helper'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { createErrata } from '../../../src/modules/book-erratas/book-erratas-service'

const getOriginalBook = async (id: string) => (
  R.pipeWith(R.andThen)([
    async id => findBookForSync(id, 'id'),
    R.when(
      R.isNil,
      () => throwException(notFoundException('Book'))
    ),
  ])(id)
)

const copyBookExam = (book_id: string) => async (id: string) => (
  R.pipe(
    R.prop('exam_id'),
    async (exam_id: string) => createAttachedExam(AttachedExamTypeEnum.book, exam_id, book_id)
  )(id)
)

const copyExamAttachedToBook = async (source_book_id: string, target_book_id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findOneOrFail({ id }, ['attached']),
    R.prop('attached'),
    R.unless(
      R.isNil,
      copyBookExam(target_book_id)
    ),
  ])(source_book_id)
)

const copySingleErrata = (target_book) => async (errata) => {
  const [originalBookContentPath, originalBookSubchapterPath, originalBookChapterPath] = await Promise.all([
    findPathByBookContentId(errata.book_content_id),
    findPathByBookSubchapterId(errata.subchapter_id),
    findPathByBookChapterId(errata.chapter_id),
  ])

  const [newBookContentPath, newBookSubchapterPath, newBookChapterPath] = await Promise.all([
    originalBookContentPath ? findBookContentIdByPath(target_book.id, originalBookContentPath) : undefined,
    findBookSubchapterIdByPath(target_book.id, originalBookSubchapterPath),
    findBookChapterIdByPath(target_book.id, originalBookChapterPath),
  ])

  const errataDto = R.omit(['id'])(errata)

  return createErrata({
    ...errataDto,
    book_id: target_book.id,
    chapter_id: newBookChapterPath.id,
    subchapter_id: newBookSubchapterPath.id,
    book_content_id: newBookContentPath?.id ?? null,
  })
}

const copyBookErratas = async (source_book_id: string, target_book) => {
  const bookErratas = await findErratas({ limit: { page: 1, take: 1000 }, order: { by: 'created_at', dir: 'desc' } }, { book_id: source_book_id })

  return R.pipe(
    R.prop('data'),
    collectionToJson,
    mapP(copySingleErrata(target_book))
  )(bookErratas)
}

export const copyBook = async (book_id: string) => {
  const originalBook = await getOriginalBook(book_id)
  const book = await createBookFromOriginal(originalBook)

  const originalChapters = R.prop('chapters')(originalBook)

  await forEachP(
    cretateBookChaptersFromOriginalChapters(book.id)
  )(originalChapters)

  await copyExamAttachedToBook(book_id, book.id)
  await copyBookErratas(book_id, book)

  return book
}
