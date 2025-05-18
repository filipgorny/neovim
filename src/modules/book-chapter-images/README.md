# book-chapter-images

A book chapter may have images assigned. This module allows to manage them.

## Routes

`POST /book-chapter-images`

Create a book chapter image.

`PATCH /book-chapter-images/:id`

Update the image.

`GET /book-chapter-images/:id`

Fetch all images for the given chapter.

`DELETE /book-chapter-images/:id`

Remove a book chapter image.

## Related DB tables
- `book_chapter_images`
