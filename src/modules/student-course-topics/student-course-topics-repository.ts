import orm, { StudentCourseTopic } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourse } from '../../types/student-course'

const { knex } = orm.bookshelf

const MODEL = StudentCourseTopic
const MODEL_NAME = 'StudentCourseTopic'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], withStrictCount = false) => (
  fetchCustom(qb)(withRelated, { limit, order }, false, {}, withStrictCount)
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findStudentCourseTopics = async (query, filter) => {
  const { search, ...where } = filter || {}

  let qb = MODEL.query(qb => {
    qb.select('student_course_topics.*', 'course_topics.topic', 'course_topics.order', 'course_topics.level')
    qb.leftJoin('course_topics', 'student_course_topics.original_course_topic_id', 'course_topics.id')

    if (search) {
      qb.whereRaw(`(
        course_topics.topic ilike '%' || ? || '%' 
      )`, [search])
    }

    qb.orderBy('course_topics.order', query.order?.dir || 'asc')

    // Add grouping by all selected columns to avoid the GROUP BY error
    qb.groupBy('student_course_topics.id', 'course_topics.order', 'course_topics.topic', 'course_topics.level')
  })

  if (where) {
    qb = qb.where(where)
  }

  return findCustom(qb)(
    query.limit,
    query.order,
    ['bookContentCourseTopics.studentBookContent.subchapter.chapter.book'],
    true
  )
}

export const findStudentCourseTopicsByTopicIds = async (topicIds: string[]) => {
  const qb = MODEL.whereIn(knex.raw('student_course_topics.id'), topicIds)
    .query(qb => {
      qb.select('student_course_topics.*', 'course_topics.topic', 'course_topics.order', 'course_topics.level')
      qb.leftJoin('course_topics', 'student_course_topics.original_course_topic_id', 'course_topics.id')
      qb.orderBy('course_topics.order', 'desc')
      qb.groupBy('student_course_topics.id', 'course_topics.order', 'course_topics.topic', 'course_topics.level')
    })

  return findCustom(qb)(
    { take: 100, page: 1 },
    { by: 'course_topics.order', dir: 'desc' },
    ['courseTopic', 'bookContentCourseTopics.studentBookContent.subchapter.chapter.book']
  )
}

export const findStudentCourseTopicsByStudentBookContentId = async (studentCourse: StudentCourse, student_book_content_id: string) => {
  return knex.from('student_course_topics AS sct')
    .select('sct.*')
    .leftJoin('student_book_content_course_topics AS sbcct', 'sbcct.student_course_topic_id', 'sct.id')
    .where('sct.student_course_id', studentCourse.id)
    .andWhere('sbcct.student_book_content_id', student_book_content_id)
}

export const deleteByStudentCourseId = async (student_course_id: string) => (
  _delete(MODEL)({ student_course_id })
)
