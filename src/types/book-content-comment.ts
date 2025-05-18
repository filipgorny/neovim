export type BookContentComment = {
  id: string,
  course_id: string,
  book_content_id: string,
  comment_raw: string,
  comment_html: string,
  comment_delta_object: object,
  is_read?: boolean,
}

export type BookContentCommentDTO = Omit<BookContentComment, 'id'>
