export default (bookId) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book)) from (
      select * from books sb
      where id = ?
    ) as book
  ) as book`, [bookId])
)
