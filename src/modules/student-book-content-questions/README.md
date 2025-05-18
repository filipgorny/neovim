# student-book-content-questions

Module for managing book content questions in a student's copy of the book. See `book-content-questions/README.ts`.

## Routes

`PATCH /student-book-content-questions/:id/answer`

**DEPRECATED**

Answer a single question.

After refactoring this module, this route has become obsolete. See the new upsert route below.

`PATCH /student-book-content-questions/:question_id/reset`

Reset the question so it can be answered again. This operation costs Salty Bucks.

`GET /student-book-content-questions/chapter-reset-cost/:chapter_id`

Get the cost for resetting all questions in a chapter.

`POST /student-book-content-questions/chapter-reset/:chapter_id`

Reset all questions in a chapter.

`POST /student-book-content-questions/book_content_question_id/:book_content_question_id/upsert-answer`

Answer a single question

## Related DB tables
- `student_book_content_questions`
