# course-topics

Each course may have a list of course topics that are being covered by said course.

## Routes

`POST /course-topics/:course_id`

Create a course topic.

`POST /course-topics/:course_id/upload`

Create a list of course topics from an XLSX file.

`POST /course-topics/:course_id/topic/:id`

Create a nested course topic.

`GET /course-topics/:course_id`

Get a list of course topics.

`GET /course-topics/:course_id/topic/:id`

Fetch a single course topic.

`GET /course-topics/:course_id/attached`

Get course topics for given course.

`PATCH /course-topics/:course_id/topic/:id`

Update a single course topic.

`PATCH /course-topics/:course_id/topic/:id/reorder/:direction`

Reorder course topics.

`DELETE /course-topics/:course_id/topic/:id`

Remove a single course topic.

`DELETE /course-topics/:course_id`

Remove all topics from a given course.

## Related DB tables
- `course_topics`
