import * as R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { create, patch, findOneOrFail } from './student-book-content-comments-repository'
import { find as findOriginalComments } from '../book-content-comments/book-content-comments-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

const getCommentsByCourseId = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async (course_id) => findOriginalComments(
      { limit: { take: 10000, page: 1 }, order: { by: 'course_id', dir: 'asc' } },
      function () {
        this
          .where({ course_id })
          .whereRaw('(book_content_id not in (select id from book_contents where deleted_at is not null))')
      }
    ),
    R.prop('data'),
    collectionToJson,
  ])(course_id)
)

const makeStudentComment = (studentCourseId: string) => (comment: any) => ({
  student_course_id: studentCourseId,
  original_book_content_id: comment.book_content_id,
  comment_html: comment.comment_html,
  is_read: false,
})

export const copyCommentsForCourse = async (course_id: string, studentCourseId: string) => (
  R.pipeWith(R.andThen)([
    getCommentsByCourseId,
    R.map(makeStudentComment(studentCourseId)),
    mapP(createEntity),
  ])(course_id)
)

export const markCommentAsRead = async (student_course_id: string, original_book_content_id: string) => {
  const comment = await findOneOrFail({ student_course_id, original_book_content_id })

  return patch(comment.id, {
    is_read: true,
  })
}
