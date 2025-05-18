# hangman-hints

Module for managing hints available in the Hangman games.

## Routes

`POST /hangman-hints`

Record a hint.

`GET /hangman-hints/:id`

Fetch a hint by ID.

`GET /hangman-hints/phrase/:phrase_id`

Fetch hints for a given phrase.

`PATCH /hangman-hints/:id`

Update a hint.

`PATCH /hangman-hints/:id/reorder/:direction`

Change the hint ordering.

`DELETE /hangman-hints/:id`

Remove a hint.

## Related DB tables
- `hangman_hints`
