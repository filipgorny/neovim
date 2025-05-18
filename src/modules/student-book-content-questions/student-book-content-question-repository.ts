import * as R from 'ramda'
import StudentBookContentQuestionDTO from './dto/student-book-content-question'
import { StudentBookContentQuestion } from '../../models'
import { _create, _findOneOrFail, _patch, _deleteAllByCustomColumn, _patchAll, _findOne } from '../../../utils/generics/repository'
import { fetchRaw } from '../../../utils/model/fetch'

const MODEL = StudentBookContentQuestion
const MODEL_NAME = 'StudentBookContentQuestion'

export const create = async (dto: StudentBookContentQuestionDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOne = async (where: object, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const patch = async (id: string, data: {}, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const patchAll = async (ids: string[], data: {}, trx?) => (
  _patchAll(MODEL)(ids, data, trx)
)

const buildContentQuestionProgressQueryByBooks = (studentId: string, studentCourseId: string) => async knex => {
  const qb = knex.from('student_courses AS sc')
    .select(knex.raw(
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = true) as correct,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = false) as incorrect,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct is null) as untried,' +
      'sb.id as student_book_id , sb.title,' +
      'sb.book_id AS original_book_id,' +
      'sb.tag AS book_tag'
    ))
    .leftJoin('student_books AS sb', 'sb.course_id', 'sc.id')
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_questions AS sbcq', 'sbcq.content_id', 'sbc2.id')
    .where('sc.id', studentCourseId)
    .andWhere('sc.student_id', studentId)
    .andWhere('sb.is_test_bundle', false)
    .groupBy('sb.id')

  return qb
}

const wrapFetchRaw = fn => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    fn
  )({
    limit: undefined,
    order: {},
  }),
  R.prop('data'),
])(true)

const buildContentQuestionProgressQueryByCourse = (studentId: string, studentCourseId: string) => async knex => {
  const qb = knex.from('student_courses AS sc')
    .select(knex.raw(
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = true) as correct,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = false) as incorrect,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct is null) as untried,' +
      '\'All\' as book_tag'
    ))
    .leftJoin('student_books AS sb', 'sb.course_id', 'sc.id')
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_questions AS sbcq', 'sbcq.content_id', 'sbc2.id')
    .where('sc.id', studentCourseId)
    .andWhere('sc.student_id', studentId)
    .andWhere('sb.is_test_bundle', false)
    .groupBy('sc.id')

  return qb
}

export const fetchContentQuestionProgressByBooks = async (studentId: string, studentCourseId: string) => (
  wrapFetchRaw(
    buildContentQuestionProgressQueryByBooks(studentId, studentCourseId)
  )
)

export const fetchContentQuestionProgressByCourse = async (studentId: string, studentCourseId: string) => (
  wrapFetchRaw(
    buildContentQuestionProgressQueryByCourse(studentId, studentCourseId)
  )
)

export const deleteContentQuestionsByContentId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('content_id', [content_id])
)
