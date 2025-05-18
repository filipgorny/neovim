# socket-servers

Module handling notification live dispatch (see `notifications/README.md`).

## Routes

`POST /socket-servers/student/:student_id/send-notification`

Send a single notification to a given student.

`POST /socket-servers/students/bulk-send-notification`

Send a notification to a group of students.

`POST /socket-servers/students/all/send-notification`

Send a notification to all students.

## Related DB tables
- `notifications`
