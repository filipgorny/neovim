# student-video-ratings

Students can rate videos, this module handles this.

## Routes

`POST /student-video-ratings/:video_id`

Create a video rating. Student earns Salty Bucks for the first rating of given video.

`GET /student-video-ratings/:video_id`

Fetch a video rating.

`PATCH /student-video-ratings/set-price`

Admin sets the Salty Bucks value earned for rating a video.

## Related DB tables
- `student_video_ratings`
