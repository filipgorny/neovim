import { makeDTO } from './dto/student-attached-exam-dto'
import { AttachedExamType } from '../attached-exams/attached-exam-types'
import { create, deleteByIds, deleteByStudentExamId } from './student-attached-exam-repository'
import orm from '../../models'

const { knex } = orm.bookshelf

export const createStudentAttachedExamRecord = async (course_id: string, original_attached_id: string, type: AttachedExamType, exam_id: string) => (
  create(
    makeDTO(course_id, original_attached_id, type, exam_id)
  )
)

export const deleteAttachedExamsByIds = async (ids: string[], trx?) => (
  deleteByIds(ids, trx)
)

export const deleteAttachedExamsByStudentExamId = async (student_exam_id: string) => (
  deleteByStudentExamId(student_exam_id)
)
