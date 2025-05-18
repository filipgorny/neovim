# course-end-date-days

Live courses may have specific classes defined for specific days and hours. These days are grouped in terms / semesters (course_end_dates).

## Routes

`POST /end-date-days`

Create a day for specific course end date.

`GET /end-date-days/:id`

Fetch a single day.

`GET /end-date-days/:id/student`

Fetch a single day for a student.

`GET /end-date-days/end-date/:end_date_id`

Fetch all days for a given end date.

`PATCH /end-date-days/:id`

Update end date day.

`DELETE /end-date-days/:id`

Remove a single end date day.

## Related DB tables
- `course_end_date_days`
