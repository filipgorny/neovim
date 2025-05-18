# attached-exams

Exams can be attached to a course in three different ways - to a course directly, to a book and to a book chapter. This module allows to manage attached exams.

## Routes
`PATCH /attached-exams/:course_id/exam/:exam_id`

Toggle a free trial exam in a course.

`PATCH /attached-exams/:course_id/exam-featured/:exam_id`

Toggle a featured free trial exam in a course. These are visible in the widget on the dashboard.

## Related DB tables
- `attached_exams`
