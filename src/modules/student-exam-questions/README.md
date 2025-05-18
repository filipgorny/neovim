# student-exam-questions

Module reflecting exam questions in student's copy of the exam. See `exam-questions/README.md`

## Routes

`GET /student-exam-questions/:id`

Fetch a single question.

`PATCH /student-exam-questions/:id/canvas`

The student can "draw" on a question, this method is used to save the result.

`PATCH /student-exam-questions/:id/toggle-flagged`

Toggle if a question is marked as "flagged" by the student.

`PATCH /student-exam-questions/:id/status`

Change the question's status.

`PATCH /student-exam-questions/:id/answer`

Record the student's answer to a question.

## Related DB tables
- `student_exam_questions`
