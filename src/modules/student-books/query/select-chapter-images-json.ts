import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(chapter_images)) from (
      select sbci.* from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_chapter_images sbci on sbci.chapter_id = sbc.id
      where sb.book_id  = ?
        and sb.student_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        ${filterByCourse(studentCourse?.id)}
    ) as chapter_images
  ) as chapter_images`, [bookId, studentId, chapterOrder])
)
