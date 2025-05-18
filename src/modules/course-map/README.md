# course-map

Module for mapping different variants of the same course.

On the WP site, each course variant was an individual, separate product. These variants were reflected in the KrackU app using course maps.

## Routes

`GET /course/:id/map`

Fetch the course map for a given course.

`POST /course/:id/map`

Create a new map record.

`GET /course/:id/student/:student_id/map/available`

Get available map records for given student.

`GET /course/:id/map/:itemId`

Get single course map entry.

`PATCH /course/:id/map/:itemId`

Update a single course map entry.

`DELETE /course/:id/map/:itemId`

Remove a course map entry.

## Related DB tables
- `course_map`
