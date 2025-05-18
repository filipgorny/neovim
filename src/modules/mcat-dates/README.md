# mcate-dates

Each year the AAMC announces a list of available MCAT dates - dates, when an MCAT exam can be taken. These dates must be reflected in the ExamKrackers application as they are used in the calendar.

## Routes

`POST /mcat-dates`

Create an MCAT date.

`GET /mcat-dates`

Fetch all MCAT dates.

`GET /mcat-dates/:id`

Get a single MCAT date.

`PATCH /mcat-dates/:id`

Update an MCAT date.

`DELETE /mcat-dates/:id`

Remove a single MCAT date

## Related DB tables
- `mcat_dates`
