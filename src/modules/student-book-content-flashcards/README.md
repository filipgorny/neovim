# student-book-content-flashcards

Module for managing book content flashcards in a student's copy of the book. See `book-content-flashcards/README.ts`.

## Routes

`GET /student-book-content-flashcards`

Get all flashcards for a given book content.

`GET /student-book-content-flashcards/archived`

Get all archived flashcards for a given book content.

`GET /student-book-content-flashcards/study`

Fetch flashcards to study them.

`GET /student-book-content-flashcards/study-optimized`

Fetch flashcards to study them (performance-optimized version).

`GET /student-book-content-flashcards/p-lvl-stats`

Get the p-lvl (proficiency level) stats for all flashcards.

`GET /student-book-content-flashcards/student-chapter/:chapter_id/p-lvl-stats`

Get the p-lvl (proficiency level) stats for flashcards in a given chapter.

`GET /student-book-content-flashcards/box/:box_id/p-lvl-stats`

Get the p-lvl (proficiency level) stats for flashcards in a custom box (form of aggregation, managed by students).

`GET /student-book-content-flashcards/student-book/:student_book_id/p-lvl-stats`

Get the p-lvl (proficiency level) stats for flashcards in a given book.

`GET /student-book-content-flashcards/student-course/p-lvl-stats`

Get the p-lvl (proficiency level) stats for flashcards in the whole course.

`PATCH /student-book-content-flashcards/reset`

Reset the state of all flashcards (they can be marked as answered correctly or not).

`PATCH /student-book-content-flashcards/:id/answer`

Mark the answer for a given flashcard.

`POST /student-book-content-flashcards/shuffle`

Shuffle the flashcards so they are in random order.

## Related DB tables
- `student_book_content_flashcards`
