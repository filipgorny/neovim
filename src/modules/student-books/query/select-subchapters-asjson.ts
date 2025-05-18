import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(subchapters)) from (
      select sbs.* from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        ${filterByCourse(studentCourse?.id)}
    ) as subchapters
  ) as subchapters`, [studentId, bookId])
)
