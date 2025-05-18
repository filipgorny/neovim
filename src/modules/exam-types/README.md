# exam-types

Module used to manage exam types (exam type groups exams).

## Routes

`GET /exam-types`

Fetch all exam types.

`GET /exam-types/dictionary`

Get exam type subtypes.

`GET /exam-types/dictionary/:type`

Get exam type subtypes by given type.

`GET /exam-types/labels`

Get exam type labels.

`GET /exam-types/:id`

Get single exam type.

`POST /exam-types`

Create a new exam type.

`POST /exam-types/preview-exam-scaled-score-template`

**DEPRECATED**

`DELETE /exam-types/:id`

Remove an exam type.

`PATCH /exam-types/:id`

Update a single exam type.

## Related DB tables
- `exam_types`
