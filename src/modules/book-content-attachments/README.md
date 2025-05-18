# book-content-attachments

Middle column of a book, to the right from the main content. Attachments may be one of three types - text, "Salty comment" or a file. Attachments are connected to book contents.

## Routes

`POST /book-content-attachments/text`

Create a text attachment.

`POST /book-content-attachments/file`

Create a file attachment.

`PATCH /book-content-attachments/:id/text`

Update a text attachment.

`PATCH /book-content-attachments/:id/file`

Update a file attachment.

`PATCH /book-content-attachments/:id/move`

Move book attachment.

`GET /book-content-attachments/:id`

Get all attachments for a given content.

`DELETE /book-content-attachments/:id`

Remove a given book content attachment.

## Related DB tables
- `book_content_attachments`
