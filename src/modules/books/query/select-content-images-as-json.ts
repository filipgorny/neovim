export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(content_images)) from (
      select bci.*, bs.part, bs.order as subchapter_order, bcc.order as content_order
      from books b
        left join book_chapters bc on bc.book_id = b.id
        left join book_subchapters bs on bs.chapter_id = bc.id
        left join book_contents bcc on bcc.subchapter_id = bs.id
        left join book_content_images bci on bci.content_id = bcc.id
      where b.id = ?
        and b.deleted_at is null
        and bc.order = ?
    ) as content_images
  ) as content_images`, [bookId, chapterOrder])
)
