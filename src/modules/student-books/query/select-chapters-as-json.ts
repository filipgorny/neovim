import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(chapters)) from (
      select sbc.*, sbc2.subchapter_id as bookmark_subchapter_id
      from
        student_books sb
      left join student_book_chapters sbc on (sbc.book_id = sb.id)
      left join student_book_contents sbc2 on (sbc2.id = sbc.bookmark_id)
      where sb.student_id = ?
        and sb.book_id = ?
        ${filterByCourse(studentCourse?.id)}
        and sb.deleted_at is null
    ) as chapters
  ) as chapters`, [studentId, bookId])
)
