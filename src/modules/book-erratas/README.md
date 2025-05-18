# book-erratas

These erratas are issued per book and are a way to communicate changes (that were made to a book) to students.

## Routes

`POST /book-erratas`

Create a book errata.

`GET /book-erratas/book/:id`

Get all erratas for a book.

`GET /book-erratas/book-admin/:id`

Get all erratas for a book, as a boo admin.

`PATCH /book-erratas/:id`

Update a book errata.

`DELETE /book-erratas/:id`

Remove a book errata.

## Related DB tables
- `book_erratas`
