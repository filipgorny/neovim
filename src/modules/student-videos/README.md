# student-videos

Module aggregating videos the student interacted with.

## Routes

`GET /student-videos`

Fetch student videos.

`GET /student-videos/all`

Get all student videos.

`GET /student-videos/books`

Get book-related student videos.

`GET /student-videos/counters`

Fetch the counters for student videos.

`GET /student-videos/category`

Get videos by category.

`GET /student-videos/favourite`

Get favourite student videos.

`GET /student-videos/:id`

Get a video by ID.

`PATCH /student-videos/:id`

Update video interaction (i.e. how much video was watched, was it watched completely).

## Related DB tables
- `student_videos`
