# student-book-content-pins

Students can create pins (or "pin notes") in book contents (in three colour variants) in order to mark something important and add a note.

## Routes

`POST /student-book-content-pins`

Create a pin note.

`GET /student-book-content-pins/content/:id`

Get all pin notes for given book content.

`GET /student-book-content-pins/book/:id/count`

Return the count of all pin notes in given book.

`GET /student-book-content-pins/count`

Return the count of all pin notes in the whole course.

`GET /student-book-content-pins/book/:id`

Fetch pin notes by book.

`GET /student-book-content-pins/book/:id/subchapter/:subchapter_id`

Fetch pin notes by subchapter.

`GET /student-book-content-pins/course`

Fetch all pin notes from a course.

`GET /student-book-content-pins/:id`

Get a specific pin note.

`PATCH /student-book-content-pins/:id`

Update a pin note.

`DELETE /student-book-content-pins/:id`

## Related DB tables
- `student_book_content_pins`
