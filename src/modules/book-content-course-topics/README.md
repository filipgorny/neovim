# book-content-course-topics

This module is used to manage course topics within a book.

## Routes

`POST /content-topics/:book_content_id/course-topic/:course_topic_id`

Create a content course topic.

`GET /content-topics/course/:course_id/book-content/:book_content_id`

Get all book content course topics attached to a book content.

`DELETE /content-topics/:id`

Delete a content topic.

`DELETE /content-topics/course/:course_id/book-content/:book_content_id`

Remove all course topics attached to a book content.

`PATCH /content-topics/:id/comment`

Add a comment to given course topis.

## Related DB tables
- `book_content_course_topics`
