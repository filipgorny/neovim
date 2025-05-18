# book-content-resources

Additional resources can be attached to book contents (left side of the main column, clickable icons), like TMI (Too Much Information), Clinical Context, MCAT Think.

## Routes

`POST /book-content-resources/text`

Create a text resource for book content.

`POST /book-content-resources/video`

Create a video resource for book content.

`GET /book-content-resources/:id`

Fetch book content resources for a given content.

`DELETE /book-content-resources/:id`

Remove a resource from given book content.

`DELETE /book-content-resources/:id/video`

Remove a video resource from given book content.

`PATCH /book-content-resources/:id/text`

Update a text resource.

`PATCH /book-content-resources/:id/video`

Update a video resource.

## Related DB tables
- `book_content_resources`
