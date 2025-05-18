# student-exam-sections

Module reflecting exam sections in student's copy of the exam. See `exam-sections/README.md`

## Routes

`PATCH /student-exam-sections/:id/status`

Change the status of a section.

`GET /student-exam-sections/:id/graph/questions`

Get time spent for each question.

`GET /student-exam-sections/:id/time-per-passage`

Get time spent for each passage.

`GET /student-exam-sections/:id/graph/passage-reading-time`

Get passage reading time.

`GET /student-exam-sections/:id/graph/passage-working-time`

Get passage working time.

`GET /student-exam-sections/:id/graph/passages`

Get total passage working time.

## Related DB tables
- `student_exam_sections`
