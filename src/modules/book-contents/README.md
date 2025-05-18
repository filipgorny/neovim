# book-contents

Main structure element of a book.

## Routes

`POST /book-contents/text`

Create a text book content.

`POST /book-contents/file/upload`

Create a file book content.

`POST /book-contents/:id/flashcards`

Attach flashcards to a book content.

`POST /book-contents/:id/videos`

Attach videos to a book content.

`POST /book-contents/:id/questions`

Attach content questions to a book content.

`POST /book-contents/:id/questions/detach`

Detach content questions from a book content.

`POST /book-contents/:id/flashcards/:flashcard_id/detach`

Detach a single flashcard from a book content.

`PATCH /book-contents/:id/text`

Update a text book content.

`PATCH /book-contents/:id/file`

Update a file book content.

`GET /book-contents/:id`

Get all book contents for a subchapter.

`DELETE /book-contents/:id`

Delete a single book content.

## Related DB tables
- `book_contents`
