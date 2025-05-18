# student-books

Module for managing student's books. See `books/README.ts`.

## Routes

`GET /student-books`

Get student books for a given course.

`GET /student-books/:id/details/:chapter_oder/:part`

Fetch a part of the book with all related / nested data (e.g. attachments, resources).

`GET /student-books/:id/details/:chapter_oder/:part/partial/:partial`

Fetch a part of the book with partial related / nested data (e.g. attachments, resources). One relation type ("partial") per request.

`GET /student-books/:id/chapters`

Get chapters of a book.

`PATCH /student-books/:id/last-read/:chapter_oder/:part`

Mark the given chapter order and part combo as "last read".

`POST /student-books/:id/search`

Search the book for a given phrase.

`PATCH /student-books/:id/preview-state`

Set the "previe state" of the book (related to the "padlock" button, changes the display of the book).

## Related DB tables
- `student_books`
