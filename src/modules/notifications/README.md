# notifications

The application has a system of real-time notifications that can be issued to groups of students.

## Routes

`POST /notifications`

Create (schedule) a notification.

`POST /notifications/:id/send`

Send a notification.

`POST /notifications/:id/pause`

Pause a scheduled notification.

`POST /notifications/:id/unpause`

Unpause a scheduled notification.

`GET /notifications`

Fetch notifications.

`GET /notifications/:id`

Get a specific notification.

`PATCH /notifications/:id`

Update a notification.

`DELETE /notifications/:id/soft`

Remove (soft) a notification.

`DELETE /notifications/:id/hard`

Delete a notification permanently.

## Related DB tables
- `notifications`
