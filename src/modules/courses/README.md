# courses

Courses are one of the top-level entities in the application. Students buy courses to access the application. Courses can hold books and exams.

## Routes

`POST /book-courses`

Create a course.

`POST /book-courses/:id/attach/exams`

Attach exams to a course.

`POST /book-courses/:id/attach/books`

Attach books to a course.

`POST /book-courses/:id/book/:book_id`

Attach a single book to a course.

`POST /book-courses/:id/copy`

Create a copy of a course.

`GET /book-courses`

Get a list of courses.

`GET /book-courses/:id`

Fetch a specific course.

`GET /book-courses/list/simple`

Get a simple list of courses.

`GET /book-courses/list/simple/admin/:admin_id`

Get a simple list of courses (different variant).

`GET /book-courses/:id/course-books`

Fetch a list of course books.

`PATCH /book-courses/:id`

Update a course.

`PATCH /book-courses/:id/book/:book_id/free-trial`

Toggle a free trial book in a course.

`PATCH /book-courses/:id/meeting-url`

Set the meeting URL for the course.

`PATCH /book-courses/:id/toggle-calendar`

Toggle the calendar in the course (if it's accessible or not).

`PATCH /book-courses/:id/toggle-ai-tutor`

Toggle the AI Tutor in a course.

`PATCH /book-courses/:id/dashboard-settings`

Update the dashboard settings (widget visibility).

`DELETE /book-courses/:id`

Remove a course.

`DELETE /book-courses/:id/book/:book_id`

Detach a book from a given course.

## Related DB tables
- `courses`
