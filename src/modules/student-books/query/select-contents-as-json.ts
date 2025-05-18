import { PinNoteVariantEnum as Variant } from '../../student-book-content-pins/pin-note-variants'
import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book_contents)) from (
      select
      (
        select row_to_json(pin_notes) from (
          select
            count(distinct sbcp.id) filter (where sbcp.variant = '${Variant.A}') as has_pins_a,
            count(distinct sbcp.id) filter (where sbcp.variant = '${Variant.B}') as has_pins_b,
            count(distinct sbcp.id) filter (where sbcp.variant = '${Variant.C}') as has_pins_c
          from student_book_content_pins sbcp
          where sbcc.id = sbcp.content_id
        ) as pin_notes
      ) as pin_notes, 
      sbcc.*
      from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
        left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
        ${filterByCourse(studentCourse?.id)}
    ) as book_contents
  ) as book_contents`, [studentId, bookId, chapterOrder, part])
)
