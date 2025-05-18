import * as R from 'ramda'
import { BookContentCourseTopic, BookContentCourseTopicDTO } from '../../types/book-content-course-topic'
import { create, patch, deleteRecord, deleteWhere, findOne as findBookContentTopic } from './book-content-course-topics-repository'
import { findOneOrFail as findBookContent } from '../book-contents/book-content-repository'
import { findOneOrFail as findCourseTopic } from '../course-topics/course-topics-repository'

export const createContentTopic = async (dto: BookContentCourseTopicDTO): Promise<BookContentCourseTopic> => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const deleteByBookContent = async (course_id: string, book_content_id: string) => (
  deleteWhere({ course_id, book_content_id })
)

export const deleteByCourseTopicId = async (course_topic_id: string) => (
  deleteWhere({ course_topic_id })
)

export const deleteByCourseId = async (course_id: string) => (
  deleteWhere({ course_id })
)

export const deleteByBookContentId = async (book_content_id: string) => (
  deleteWhere({ book_content_id })
)

export const markBookContentWithCourseTopic = async (book_content_id: string, course_topic_id: string, is_artificial: boolean) => {
  const [bookContent, courseTopic] = await Promise.all([
    findBookContent({ id: book_content_id }, ['subchapter.chapter.book']),
    findCourseTopic({ id: course_topic_id }),
  ])

  const book_id = R.path(['subchapter', 'chapter', 'book', 'id'])(bookContent)
  const { course_id } = courseTopic

  const existingBookContentTopic = await findBookContentTopic({
    book_content_id,
    course_topic_id,
    book_id,
    course_id,
  })

  if (existingBookContentTopic) {
    return patch(existingBookContentTopic.id, { is_artificial })
  }

  return createContentTopic({
    book_content_id,
    course_topic_id,
    book_id,
    course_id,
    is_artificial,
  })
}

export const saveBookContentCourseTopicComment = async (id: string, comment_raw: string, comment_html: string, comment_delta_object: {}) => (
  patchEntity(id, { comment_raw, comment_html, comment_delta_object })
)
