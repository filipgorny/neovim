# student-notifications

Holds instances of notifications spawned by the admins. See `notifications/README.md`.

## Routes

`GET /student-notifications/student/:student_id`

Fetch student's notifications.

`GET /student-notifications/unseen-count`

Returns the amount of unseen notifications.

`POST /student-notifications/all/read`

Mark all notifications as read.

`POST /student-notifications/all/see`

Mark all notifications as seen.

`POST /student-notifications/:id/read`

Mark single notification as read.

`POST /student-notifications/:id/unread`

Mark single notification as unread.

`PATCH /student-notifications/:id/flag`

Toggle if notification is "flagged".

## Related DB tables
- `student_notifications`
