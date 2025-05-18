# student-courses

Module for managing student's courses. See `courses/README.md`.

## Routes

`GET /student-courses`

Get all student's courses.

`GET /student-courses/:id`

Fetch a single course.

`GET /student-courses/:id/class`

Get the class associated with the given course (live class).

`GET /student-courses/product/:external_id/transaction/:transaction_id`

Fetch course details by external keys. This is used in conjunction with the WP site (https://examkrackers.com).

`POST /student-courses/purchase`

Purchase a course.

`POST /student-courses/purchase-extention`

Purchase an extension for the course.

`POST /student-courses/extend`

Extend the course (admin can do that).

`POST /student-courses/bulk-extend`

Extend several courses at once (admin can do that).

`POST /student-courses/:id/prepare`

When a student gains access to a course, a bare record is being created, just to display the course on the list. All the heavy lifting is being done once the student starts the course - all the books are being copied and all related / nested data. This route does just that.

`POST /student-courses/:id/search`

Search for a phrase within a course.

`PATCH /student-courses/:id/set-expected-end-date`

Set the date the student expects to end the course by.

`PATCH /student-courses/:id/pause`

Admin can pause a course so it's not accessible but it's not removed.

`PATCH /student-courses/:id/unpause`

Admin can unpause a course.

`PATCH /student-courses/:id/accessible-to`

Set the date until which the course is accessible.

`PATCH /student-courses/:id/flashcard-count`

Set the flashcard count.

`PATCH /student-courses/:id/book-order`

Set the book order within a course.

`PATCH /student-courses/:id/calendar-start-at`

Set the calendar start date.

`PATCH /student-courses/:id/exam-date`

Set the exam date (for the calendar).

`PATCH /student-courses/:id/reschedule-calendar`

Reschedule the calendar. This might be one of two variants:
- reorder: non-destructive, leaves past events as is
- reset: destructive, rebuilds the calendar

`PATCH /student-courses/:id/prioridays`

Set the "priorydays" (priority days). This is a list of preference, which days should be included for studying, which for exams and which should be free of events.

`PATCH /student-courses/close-extension-modal`

Mark the extension modal window as seen and closed.

`PATCH /student-courses/snooze-calendar-archive-modal`

Snooze the calendar archive popup window.

`DELETE /student-courses/:id`

Remove a student course.

## Related DB tables
- `student_courses`
