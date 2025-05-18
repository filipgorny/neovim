export default (bookId) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(subchapters)) from (
      select sbs.* from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_subchapters sbs on sbs.chapter_id = sbc.id
      where sb.id = ?
        and sbs.deleted_at is null
    ) as subchapters
  ) as subchapters`, [bookId])
)
