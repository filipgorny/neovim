# student-book-content-comments

Module for managing book content comments in a student's copy of the book. See `book-content-comments/README.ts`.

## Routes

`GET /student-book-content-comments/:book_content_id`

Get a specific comment.

`PATCH /student-book-content-comments/:book_content_id/read`

Mark a comment as "read".

## Related DB tables
- `student_book_content_comments`
