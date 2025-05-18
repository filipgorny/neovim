export default (bookId) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(chapters)) from (
      select sbc.* from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
      where sb.id = ?
        and sbc.deleted_at is null
    ) as chapters
  ) as chapters`, [bookId])
)
