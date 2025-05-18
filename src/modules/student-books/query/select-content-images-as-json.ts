import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(content_images)) from (
      select sbci.*, sbs.part, sbs.order as subchapter_order, sbcc.order as content_order
      from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
        left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join student_book_content_images sbci on sbci.content_id = sbcc.id
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        ${filterByCourse(studentCourse?.id)}
    ) as content_images
  ) as content_images`, [studentId, bookId, chapterOrder])
)
