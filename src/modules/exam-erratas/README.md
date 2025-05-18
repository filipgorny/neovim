# exam-erratas

These erratas are issued per exam and are a way to communicate changes (that were made to an exam) to students.

## Routes

`POST /exam-erratas`

Create an errata.

`GET /exam-erratas/exam/:id`

Fetch erratas for a given exam.

`GET /exam-erratas`

Fetch all exam erratas.

`PATCH /exam-erratas/:id`

Update an errata.

`DELETE /exam-erratas/:id`

Remove an errata.

## Related DB tables
- `exam_erratas`
