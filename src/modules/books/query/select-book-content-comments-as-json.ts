export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book_content_comments)) from (
      select distinct bcc.*
      from books b
        left join book_chapters bc on bc.book_id = b.id
        left join book_subchapters bs on bs.chapter_id = bc.id
        left join book_contents bc2 on bc2.subchapter_id = bs.id
        left join book_content_comments bcc on bcc.book_content_id = bc2.id
        left join courses c on c.id = bcc.course_id
      where b.id = ?
        and bs.deleted_at is null
        and bc2.deleted_at is null
        and c.deleted_at is null
        and bc.order = ?
        and bs.part = ?
    ) as book_content_comments
  ) as book_content_comments`, [bookId, chapterOrder, part])
)
