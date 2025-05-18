# book-content-questions

Content questions can be attached to book contents.

## Routes

`PATCH /book-content-questions/:id/content/:content_id/reorder/:direction`

Reorder content questions.

`GET /book-content-questions/subchapter/:id`

Get all content questions for a given subchapter.

`GET /book-content-questions/:id`

Fetch contnent questions for a given content.

`DELETE /book-content-questions/:id`

Remove content questions from given book content.

## Related DB tables
- `book_content_questions`
