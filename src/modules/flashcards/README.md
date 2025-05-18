# flashcards

The application encourages the student to memorize various info using flashcards. This module is responsible for managing them.

## Routes

`POST /flashcards`

Create a flashcard.

`POST /flashcards/:id/set-code`

Set a flashcard code (number).

`PATCH /flashcards/:id`

Update a flashcard.

`GET /flashcards`

Get all flashcards.

`GET /flashcards/:id`

Fetch a specific flashcard.

`DELETE /flashcards/:id`

Remove a flashcard.

## Related DB tables
- `flashcards`
