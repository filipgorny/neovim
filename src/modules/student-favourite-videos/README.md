# student-favourite-videos

Module for marking course videos as favourite. This is for videos related to courses. See `favourite-videos/README.md`.

## Routes

`GET /student-favourite-videos`

Get student favourite videos.

`GET /student-favourite-videos/count`

Get the amount of favourite videos.

`POST /student-favourite-videos/resource/:resource_id/mark-as-favourite`

Mark video as favourite.

`POST /student-favourite-videos/resource/:resource_id/unmark-as-favourite`

Unmark video as favourite.

## Related DB tables
- `student_favourite_videos`
