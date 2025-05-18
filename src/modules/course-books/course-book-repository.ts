import R from 'ramda'
import CourseBookDTO from './dto/course-book-dto'
import { CourseBook } from '../../models'
import {
  _deleteAll,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _patchWhere
} from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const MODEL = CourseBook
const MODEL_NAME = 'CourseBook'

export const create = async (dto: CourseBookDTO, trx?) => (
  _create(MODEL)(dto, trx)
)

export const removeAll = async (course_id: string, excludeExamIds: string[], trx?) => (
  MODEL.whereNotIn('book_id', excludeExamIds).where({
    course_id,
  }).destroy({
    require: false,
    ...trx && { transacting: trx },
  })
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number } | {}, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = [], disablePagination = false) => (
  fetch(MODEL)({
    ...where,
  }, withRelated, query, disablePagination)
)

export const findFreeTrialExamsForCourse = async (course_id: string): Promise<any> => {
  const books = await MODEL.where({ course_id, is_free_trial: true })
    .fetchAll({
      withRelated: [
        'exam',
      ],
    })

  const exams = R.map(book => book.exam, R.invoker(0, 'toJSON')(books))

  return exams
}

export const findBookForCourse = async (course_id: string): Promise<any> => {
  const books = await MODEL.where({ course_id })
    .fetchAll({
      withRelated: [
        'exam.sections.passages.questions',
        'book.attached.exam.sections.passages.questions',
        'book.chapters.attached.exam.sections.passages.questions',
        'book.chapters.subchapters.contents.resources',
        'book.chapters.subchapters.contents.questions.question',
        'book.chapters.subchapters.contents.images',
        'book.chapters.subchapters.contents.flashcards',
        'book.chapters.subchapters.contents.attachments',
        'book.chapters.images',
      ],
    })

  return R.invoker(0, 'toJSON')(books)
}

export const deleteByBookId = async (book_id: string) => (
  _delete(MODEL)({ book_id })
)

export const deleteOne = async (course_id: string, book_id: string) => (
  _delete(MODEL)({ course_id, book_id })
)

export const patchWhere = async (where: object, dto: object) => (
  _patchWhere(MODEL)(where, dto)
)
