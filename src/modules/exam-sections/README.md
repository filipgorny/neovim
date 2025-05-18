# exam-sections

Module used to manage exam sections.

## Routes

`PATCH /exam-sections/:id/scores`

Set minimum and maximum scores for given section.

`POST /exam-sections/:id/set-all-scores`

Set all scores at once.

`GET /exam-sections/:id/scores`

Get scores for given section.

`GET /exam-sections/:id/diagram`

Get score diagram (for admin).

`GET /exam-sections/exam/:exam_id/diagram-all`

Get all diagrams for given exam.

`GET /exam-sections/mock-diagram/get-data`

**DEPRECATED**

Legacy endpoint used during the development.

## Related DB tables
- `exam_sections`
