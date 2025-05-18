# student-box-flashcards

Module for aggregating flashcards in student's custom boxes.

## Routes

`POST /student-box-flashcards/box/:box_id/flashcard/:student_flashcard_id`

Put the flashcard into the box.

`DELETE /student-box-flashcards/box/:box_id/flashcard/:student_flashcard_id`

Remove a flashcard from the box.

`PATCH /student-box-flashcards/box/:box_id/bulk-delete`

Remove many flashcards from a box at once.

## Related DB tables
- `student_box_flashcards`
