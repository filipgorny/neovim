export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book_contents)) from (
      select sbcc.* from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_subchapters sbs on sbs.chapter_id = sbc.id
        left join book_contents sbcc on sbcc.subchapter_id = sbs.id
      where sb.id = ?
        and sbs.deleted_at is null
        and sbcc.deleted_at is null
        and sbc."order" = ?
        and sbs.part = ?
    ) as book_contents
  ) as book_contents`, [bookId, chapterOrder, part])
)
