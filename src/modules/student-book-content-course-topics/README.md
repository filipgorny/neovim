# student-book-content-course-topics

Module for managing book content course topics in a student's copy of the book. See `book-content-course-topics/README.ts`.

## Routes

`GET /student-content-topics/book-content/:student_book_content_id`

Get course topics for a given book content.

`PATCH /student-content-topics/:id/read`

Mark a course topic as "read".

## Related DB tables
- `student_book_content_course_topics`
