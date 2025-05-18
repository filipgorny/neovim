import { StudentCourse } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourseDTO } from '../../types/student-course'
import { StudentCourseStatus } from './student-course-status'

const MODEL = StudentCourse
const MODEL_NAME = 'StudentCourse'

export const createStudentCourse = async (dto: StudentCourseDTO) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const fetchExistingCourseCount = (externalCreatedAt: string, book_course_id: string, student_id: string) => (
  MODEL.where({
    book_course_id,
    student_id,
  }).andWhere('external_created_at', '>=', externalCreatedAt)
    .count()
)

export const expireCourse = async id => (
  patch(id, {
    status: StudentCourseStatus.expired,
  })
)
