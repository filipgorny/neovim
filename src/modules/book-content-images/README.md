# book-content-images

This module is used to manage images attached to book contents.

## Routes

`POST /book-content-images`

Create a book content image.

`PATCH /book-content-images/:id`

Update a book content image.

`GET /book-content-images/:id/:part`

Fetch all images for a given book part.

`DELETE /book-content-images/:id`

Remove a book content image.

## Related DB tables
- `book_content_images`
