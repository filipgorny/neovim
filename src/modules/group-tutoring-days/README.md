# group-tutoring-days

The module for managing scheduled group tutoring days in various courses.

## Routes

`POST /group-tutoring-days`

Create a group tutoring day.

`GET /group-tutoring-days/upcoming`

Fetch upcoming group tutoring days for the current course.

`GET /group-tutoring-days/future-classes`

Get future tutoring days.

`GET /group-tutoring-days/:id`

Fetch a specific tutoring day.

`GET /group-tutoring-days/course/:course_id`

Get all tutoring days for a given course.

`PATCH /group-tutoring-days/:id`

Update a group tutoring day.

`DELETE /group-tutoring-days/:id`

Remove a tutoring day.

## Related DB tables
- `group_tutoring_days`
