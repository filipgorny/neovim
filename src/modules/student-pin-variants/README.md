# student-pin-variants

Pins can be grouped into custom pin variants. See `student-book-content-pins/README.md`.

## Routes

`POST /student-pin-variants`

Upsert a pin variant (per book).

`GET /student-pin-variants/:student_book_id`

Fetch pin variants for a book.

## Related DB tables
- `student_pin_variants`
