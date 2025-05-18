export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(original_book)) from (
      select * from books b
      where id = ?
    ) as original_book
  ) as original_book`, [bookId])
)
