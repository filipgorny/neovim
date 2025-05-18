import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book)) from (
      select * from student_books sb
      where student_id = ?
        and book_id = ?
        and deleted_at is null
        ${filterByCourse(studentCourse?.id)}
    ) as book
  ) as book`, [studentId, bookId])
)
