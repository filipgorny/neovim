# content-question-reactions

Module used to manage reactions (short animations with sound) to answering a content question by the student.

## Routes

`POST /content-question-reactions`

Create a reaction.

`GET /content-question-reactions`

Get a list of reactions.

`GET /content-question-reactions/random`

Get a random reaction.

`GET /content-question-reactions/:id`

Fetch a reaction by ID.

`PATCH /content-question-reactions/bulk-delete`

Delete many reactions at once.

`PATCH /content-question-reactions/:id`

Update a single reaction.

`DELETE /content-question-reactions/:id`

Remove a single reaction.

## Related DB tables
- `content_question_reactions`
