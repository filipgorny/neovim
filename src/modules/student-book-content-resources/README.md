# student-book-content-resources

Module for managing book content resources in a student's copy of the book. See `book-content-resources/README.ts`.

## Routes

`PATCH /student-book-content-resources/:id`

Update a student's book content resource. This basically means that the student can make a highlight in the resource (highlighting something means the HTML is altered).

`PATCH /student-book-content-resources/:id/read`

Mark a resource as "read".

## Related DB tables
- `student_book_content_resources`
