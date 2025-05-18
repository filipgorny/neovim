# book-subchapters

Subchapters group book contents.

## Routes

`POST /book-subchapters`

Create a subchapter.

`PATCH /book-subchapters/:id`

Update a subchapter.

`PATCH /book-subchapters/:id/move`

Move a subchapter (ordering).

`PATCH /book-subchapters/:id/move-to-part`

Move a subchapter to a different part.

`PATCH /book-subchapters/:id/split/:content_id`

Split subchapter into two subchapters.

`PATCH /book-subchapters/:id/merge`

Merge two subchapters.

`GET /book-subchapters/:chapter_id`

Get all subchapters in a chapter.

`GET /book-subchapters/:id/with-contents`

Get all subchapters in a chapter with contents.

`GET /book-subchapters/:chapter_id/:part`

Get subchapters from a given part.

`DELETE /book-subchapters/:id`

Delete a given subchapter.

## Related DB tables
- `book_subchapters`
