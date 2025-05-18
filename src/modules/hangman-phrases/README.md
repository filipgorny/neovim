# hangman-phrases

Module for managing phrases (to be guessed) in the Hangman games.

## Routes

`POST /hangman-phrases`

Create a phrase.

`POST /hangman-phrases/with-hints`

Create a phrase with hints.

`POST /hangman-phrases/upload-image-hint`

Upload an image hint.

`GET /hangman-phrases/categories`

Fetch available phrase categories.

`GET /hangman-phrases/:id`

Get a phrase by ID.

`GET /hangman-phrases`

Fetch phrases.

`PATCH /hangman-phrases/:id`

Update a phrase.

`PATCH /hangman-phrases/:id/with-hints`

Update a phrase with hints.

`DELETE /hangman-phrases/:id`

Remove a phrase.

## Related DB tables
- `hangman_phrases`
