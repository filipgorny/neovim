# course-tutors

Module for managing tutors available in a course.

## Routes

`POST /course-tutors`

Create a course tutor.

`GET /course-tutors/course/:course_id`

Fetch all tutors for a given course.

`GET /course-tutors/:id`

Fetch a specific tutor.

`PATCH /course-tutors/:id`

Update a given tutor.

`PATCH /course-tutors/:id/toggle-is-active`

Toggle tutor's availability.

`DELETE /course-tutors/:id`

Remove a tutor.

## Related DB tables
- `course_tutors`
