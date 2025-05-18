# student-book-chapters

Module for managing chapters in a student's copy of the book. See `book-chapters/README.ts`.

## Routes

`GET /student-book-chapters/:id/notes`

Fetch chapter notes.

`GET /student-book-chapters/:id/subchapters`

Fetch available subchapters.

`PATCH /student-book-chapters/:id/part/:part/read`

Mark the given part of the chapter as "read".

`POST /student-book-chapters/:id/bookmark`

Create a bookmark in the chapter to mark where the student has finished studying.

`DELETE /student-book-chapters/:id/bookmark`

Remove a bookmark.

## Related DB tables
- `student_book_chapters`
