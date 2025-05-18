# glossary

The application holds a glossary of various terms. Students can use it to get more details on specific topics.

## Routes

`POST /glossary`

Create a glossary entry.

`POST /glossary/scan`

**DEPRECATED**

This route was used to scan a piece of data to see if there should be glossary entries attached.

`GET /glossary`

Fetch glossary items.

`GET /glossary/search`

Search the glossary for a specific phrase.

`GET /glossary/:id`

Fetch a glossary item by ID.

`GET /glossary/:id/scan-books`

**DEPRECATED**

This route was used to scan books to see if there should be glossary entries attached.

`PATCH /glossary/:id`

Update a glossary entry.

`DELETE /glossary/:id`

Remove a glossary entry.

## Related DB tables
- `glossary`
