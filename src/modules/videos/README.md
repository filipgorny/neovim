# videos

Module for managing videos.

## Routes

`POST /videos`

Create a video.

`PATCH /videos/:id`

Update a video.

`PATCH /videos/:id/fake-rating`

Set "fake rating" value.

`PATCH /videos/:id/toggle-fake-rating`

Toggle "fake rating" usage.

`GET /videos`

Fetch videos.

`GET /videos/:id`

Get single video.

`DELETE /videos/:id`

Delete a video.

## Related DB tables
- `videos`
