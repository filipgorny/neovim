# student-book-subchapter-notes

Module for managing student's subchapter notes.

## Routes

`GET /student-book-subchapter/book/:id/notes`

Get all subchapter notes for a given book.

`GET /student-book-subchapter/course/notes`

Get all subchapter notes for the whole course.

`GET /student-book-subchapter/:id/notes`

Get the notes for the given subchapter.

`POST /student-book-subchapter/:id/notes`

Upsert a subchapter note.

## Related DB tables
- `student_book_subchapter_notes`
