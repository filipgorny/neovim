import * as R from 'ramda'
import { findOneOrFail as findStudentCourse } from '../student-courses/student-course-repository'
import { find as findStudentBooks } from '../student-books/student-book-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { getContentsInCourse } from '../student-book-contents/student-book-content-repository'
import { create, patch, patchCustom, patchWhere } from './student-book-content-course-topics-repository'
import { findForCourse as findBookContentCourseTopicsForCourse } from '../book-content-course-topics/book-content-course-topics-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentBookContentCourseTopic } from '../../models'

const createStudentBookContentCourseTopic = async (dto) => (
  create(dto)
)

const getStudentBooks = async (student_course_id: string) => (
  R.pipeWith(R.andThen)([
    async (student_course_id) => await findStudentBooks({ limit: { take: 50, page: 1 }, order: { by: 'id', dir: 'asc' } }, { course_id: student_course_id }, ['chapters.subchapters.contents']),
    R.prop('data'),
    collectionToJson,
  ])(student_course_id)
)

const getBookContentsCourseTopics = async (studentCourse) => (
  findBookContentCourseTopicsForCourse(studentCourse.book_course_id)
)

const mapBookIdsToStudentBookIds = R.pipe(
  R.map(
    R.pick(['id', 'book_id'])
  ),
  R.map(
    item => ({
      [item.book_id]: item.id,
    })
  ),
  R.mergeAll
)

const mapBookContentIdsToStudentBookContentIds = R.pipe(
  R.map(
    R.pick(['id', 'original_content_id'])
  ),
  R.map(
    item => ({
      [item.original_content_id]: item.id,
    })
  ),
  R.mergeAll
)

const mapCourseTopicIdsToStudentCourseTopicIds = R.pipe(
  R.map(
    R.pick(['id', 'original_course_topic_id'])
  ),
  R.map(
    item => ({
      [item.original_course_topic_id]: item.id,
    })
  ),
  R.mergeAll
)

const makeStudentBookContentCourseTopic = (studentCourse, bookIdMap, bookContentIdMap, studentCourseTopicIdMap) => (bookContentCourseTopic) => {
  if (!bookContentIdMap[bookContentCourseTopic.book_content_id]) {
    return false
  }

  return {
    student_course_id: studentCourse.id,
    student_book_id: bookIdMap[bookContentCourseTopic.book_id],
    student_book_content_id: bookContentIdMap[bookContentCourseTopic.book_content_id],
    student_course_topic_id: studentCourseTopicIdMap[bookContentCourseTopic.course_topic_id],
    is_artificial: bookContentCourseTopic.is_artificial,
    comment_html: bookContentCourseTopic.comment_html,
  }
}

export const copyBookContentCourseTopics = async (student_course_id: string, studentCourseTopics) => {
  const studentCourse = await findStudentCourse({ id: student_course_id })
  const studentBooks = await getStudentBooks(studentCourse.id)
  const bookContents = await getContentsInCourse(studentCourse)

  const bookIdMap = mapBookIdsToStudentBookIds(studentBooks)
  const bookContentIdMap = mapBookContentIdsToStudentBookContentIds(bookContents)
  const studentCourseTopicIdMap = mapCourseTopicIdsToStudentCourseTopicIds(studentCourseTopics)

  const bookContentCourseTopics = await getBookContentsCourseTopics(studentCourse)

  const studentBookContentCourseTopics = R.pipe(
    R.map(
      makeStudentBookContentCourseTopic(studentCourse, bookIdMap, bookContentIdMap, studentCourseTopicIdMap)
    ),
    R.filter(R.identity)
  )(bookContentCourseTopics)

  return mapP(
    createStudentBookContentCourseTopic
  )(studentBookContentCourseTopics)
}

export const markAsRead = async (id: string, is_read: boolean) => (
  patch(id, { is_read })
)

export const markAsReadByStudentCourseTopicId = async (student_course_topic_id: string, is_read: boolean) => (
  patchWhere({ student_course_topic_id }, { is_read })
)

export const markAsSeenByBookContentIds = async (ids: string[]) => (
  patchCustom(
    StudentBookContentCourseTopic.whereIn('student_book_content_id', ids),
    { is_seen: true }
  )
)
