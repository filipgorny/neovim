import StudentAttachedExamDTO from './dto/student-attached-exam-dto'
import orm, { StudentAttachedExam } from '../../models'
import { _create, _findOne, _findOneOrFail, _deleteAll, _delete } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import { AttachedExamType } from '../attached-exams/attached-exam-types'

const { knex } = orm.bookshelf

const MODEL = StudentAttachedExam
const MODEL_NAME = 'StudentAttachedExam'

export const create = async (dto: StudentAttachedExamDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findOne = async (where: {}, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const deleteByIds = async (ids: string[], trx?) => (
  _deleteAll(MODEL)(ids, trx)
)

export const deleteByStudentExamId = async (exam_id: string) => (
  _delete(MODEL)({ exam_id })
)

export const findAttachedExamWithBookChapter = async (studentExamId: string, studentCourseId: string) => {
  const qb = knex.from('student_attached_exams as sae')
    .select([
      'sc.*',
      knex.raw(`case sc.type = 'free_trial'
        when (sae.id is not null and bc.order = 1) then true
        else se.is_free_trial
      end as is_free_trial_chapter`),
    ])
    .leftJoin('book_chapters AS bc', 'sae.original_attached_id', 'bc.id')
    .leftJoin('student_exams AS se', 'se.id', 'sae.exam_id')
    .leftJoin('student_courses AS sc', 'sc.id', 'sae.course_id')
    .where({
      'sae.exam_id': studentExamId,
      'sae.course_id': studentCourseId,
    })
    .debug(true)

  const result = await qb.first()

  return result
}
