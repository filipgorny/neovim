# book-chapters

A book consists of chapters. This module allows to manage them.

## Routes

`GET /book-chapters/:id`

Fetch chapters of a given book.

`PATCH /book-chapters/:id`

Update a single book chapter.

`PATCH /book-chapters/:id/reorder`

Reorder chapters of a book.

`PATCH /book-chapters/:id/split/:subchapter_id`

Split a chapter using a given subchapter.

`PATCH /book-chapters/:id/merge`

Merge chapters together.

`POST /book-chapters`

Create a new book chapter.

`POST /book-chapters/:id/attach/:exam_id`

Attach an exam to a chapter.

`DELETE /book-chapters/:id`

Delete a book chapter.

`DELETE /book-chapters/:id/part/:part`

Delete a book part (group of subchapters).

## Related DB tables
- `book_chapters`
