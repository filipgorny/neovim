# student-calendar-events

Core module when it comes to the calendar. This module is used to manage student's events in their calendar.

## Routes

`POST /student-calendar-events`

Create a calendar event.

`POST /student-calendar-events/complex`

Route for building complex events. It allows to create any supported event.

`POST /student-calendar-events/pre-reading`

Create the "pre-reading" events. If the student has enough free time between today and the start of the live course (which is scheduled for specific dates) the calendar will suggest creating a pre-reading. Chapter reading events will be created so the student can get familiar with the material before he actually starts studying.

`POST /student-calendar-events/live-class`

Build a live class calendar. Subscription calendar events are spread out in the calendar, using a density algorithm. On the other hand, the live class events are scheduled on specific dates.

`PATCH /student-calendar-events/reorder`

Reorder a calendar event.

`PATCH /student-calendar-events/:id`

Update a calendar event.

`GET /student-calendar-events`

Fetch all calendar events for given course.

`GET /student-calendar-events/manual/:force_rebuild?`

Get all available calendar events to be moved manually by the student (e.g. the available time-frame between today and the MCAT date is too short and the algorithm can't build the calendar).

`GET /student-calendar-events/:id`

Get a single calendar event.

`GET /student-calendar-events/date/:date`

Fetch all calendar events for given date.

`DELETE /student-calendar-events/:id`

Remove a calendar event.

## Related DB tables
- `student_calendar_events`
