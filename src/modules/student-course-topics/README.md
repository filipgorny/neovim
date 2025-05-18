# student-course-topics

Module for managing student's course topics. See `course-topics/README.md`.

## Routes

`GET /student-course-topics`

Fetch course topics.

`GET /student-course-topics/content/:student_book_content_id`

Fetch course topics for book content.

`PATCH /student-course-topics/:id/is-mastered`

Toggle if given topic is marked by student as "mastered".

## Related DB tables
- `student_course_topics`
