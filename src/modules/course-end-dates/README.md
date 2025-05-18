# course-end-dates

Live courses may have specific classes defined for specific days and hours. These days are grouped in terms / semesters (course_end_dates).

## Routes

`POST /course-end-dates`

Create an end date.

`GET /course-end-dates/course/:course_id/years`

Get a list of allowed years for given course.

`GET /course-end-dates/course/:course_id/year/:year`

Fetch a list of end dates for given year.

`GET /course-end-dates/course/:course_id`

Fetch a list of end dates for current year.

`GET /course-end-dates/course/:course_id/liki`

List of end dates for given course used by the WP site (external integration), https://examkrackers.com

`GET /course-end-dates/course/:course_id/end-date/exists`

Check if the given end date already exists.

`GET /course-end-dates/course/:course_id/end-date/students`

Get a list of students for given end date.

`GET /course-end-dates/course/:course_id/all`

Get a list of all end dates for given course.

`PATCH /course-end-dates/:id/end-date`

Update an end date.

`PATCH /course-end-dates/:id/start-date`

Change the start date of the end date (yeah, I know...).

`PATCH /course-end-dates/:id/calendar-image`

**DEPRECATED**

Set the calendar image for the given end date. This was used before the actual calendar has been built.

`PATCH /course-end-dates/:id/meeting-url`

Set the live meeting URL.

`PATCH /course-end-dates/:id/semester-name`

Change the semester name.

`DELETE /course-end-dates/:id`

Remove a course end date.

`DELETE /course-end-dates/course/:course_id`

Remove many end dates by course ID.

## Related DB tables
- `course_end_date_days`
