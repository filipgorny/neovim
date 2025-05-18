# student-flashcard-archive

Students can archive the flashcards that they wish not to study. See `student-book-content-flashcards/README.md`.

## Routes

`PATCH /student-flashcard-archive/bulk-unarchive`

Unarchive several flashcards at once.

`PATCH /student-flashcard-archive/:student_flashcard_id/archive`

Archive a single flashcard.

`PATCH /student-flashcard-archive/:student_flashcard_id/unarchive`

Unarchive a single flashcard.

`GET /student-flashcard-archive/course/:student_course_id/get-snapshot`

Get the snapshot of archived flashcards, to see how many are there in each course book.

## Related DB tables
- `student_flashcard_archive`
