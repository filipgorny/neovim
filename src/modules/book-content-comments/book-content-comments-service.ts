import * as R from 'ramda'
import { BookContentComment, BookContentCommentDTO } from '../../types/book-content-comment'
import { create, patch, findOne, deleteWhere } from './book-content-comments-repository'

export const upsertComment = async (dto: BookContentCommentDTO): Promise<BookContentComment> => {
  const comment = await findOne({ course_id: dto.course_id, book_content_id: dto.book_content_id })

  return comment ? patch(comment.id, dto) : create(dto)
}

export const createCommentOrIgnore = async (dto: BookContentCommentDTO): Promise<BookContentComment> => {
  const comment = await findOne({ course_id: dto.course_id, book_content_id: dto.book_content_id })

  return comment || create(dto)
}

export const copyCommentForNewCourse = (newCourseId: string) => async (comment: BookContentComment): Promise<BookContentComment> => {
  const newComment = {
    ...comment,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(newComment)
  )
}

export const deleteByBookContent = async (course_id: string, book_content_id: string) => (
  deleteWhere({ course_id, book_content_id })
)

export const deleteByBookContentId = async (book_content_id: string) => (
  deleteWhere({ book_content_id })
)
