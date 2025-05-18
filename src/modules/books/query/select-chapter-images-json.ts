export default (bookId, chapterOrder) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(chapter_images)) from (
      select bci.* from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_chapter_images bci on bci.chapter_id = sbc.id
      where sb.id = ?
        and sbc.deleted_at is null
        and sbc.order = ?
    ) as chapter_images
  ) as chapter_images`, [bookId, chapterOrder])
)
