# books

This module is responsible for managing books.

## Routes

`POST /books`

Create a book.

`POST /books/:id/preview`

Preview a book (to see how the student will see it).

`POST /books/:id/attach/:exam_id`

Attach an exam to a book.

`POST /books/:id/copy`

Make a copy of a book.

`POST /books/:id/renumber-flashcards`

Re-number the flashcards in a book.

`POST /books/:id/restore`

Restore a soft-deleted book.

`POST /books/:id/details/:chapter_order/:part/partial`

Fetch a book chapter with details (specific parts).

`PATCH /books/:id`

Update a book.

`PATCH /books/:id/reorder`

Reorder book chapters.

`PATCH /books/:id/archive/:is_archived`

Move a book to / from the archive.

`PATCH /books/:id/lock/:is_locked`

Lock / unlock a book (a locked book cannot be edited).

`PATCH /books/:id/flashcards/accessible/:accessible`

Toggle flashcard accessibility in a book.

`PATCH /books/:id/content-questions/auto-reorder`

Automatically reorder content questions in a book.

`PATCH /books/:id/toggle-ai-tutor`

Enable / disable the AI tutor in a book.

`GET /books`

Fetch books.

`GET /books/all`

Fetch all books.

`GET /books/archived`

Get archived books.

`GET /books/soft-deleted`

Get soft-deleted books.

`GET /books/:id`

Get single book.

`GET /books/:id/whole`

Fetch a whole single book.

`GET /books/:id/details/:chapter_order/:part`

Get a single book part with all attached items.

`GET /books/:id/details/:chapter_order/:part/partial/:partial`

Get a single book part with specified attached items.

`GET /books/:id/chapters`

Get book chapters.

`DELETE /books/:id`

Soft-delete a book.

`DELETE /books/:id/complete-removal`

Hard-delete a book.

## Related DB tables
- `books`
