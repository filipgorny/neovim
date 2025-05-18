# questions

The module for managing content questions (CQ). CQs are attached in books.

## Routes

`POST /questions`

Create a CQ.

`PATCH /questions/bulk-delete`

Remove many CQs at once.

`PATCH /questions/:id`

Update a single CQ.

`GET /questions`

Fetch CQs.

`GET /questions/:id`

Get a single CQ.

`DELETE /questions/:id`

Remove a single CQ.

## Related DB tables
- `questions`
