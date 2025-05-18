import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(flashcards)) from (
      select sbcf.*, f.question_html, f.explanation_html, f.question_image, f.explanation_image, f.question, f.explanation
      from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
        left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join student_book_content_flashcards sbcf on sbcf.content_id = sbcc.id
        left join flashcards f on f.id = sbcf.original_flashcard_id
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
        and sbcf.id NOT IN (
          select student_flashcard_id 
          from student_flashcard_archive
          where student_course_id = sb.course_id
        )
        ${filterByCourse(studentCourse?.id)}
    ) as flashcards
  ) as flashcards`, [studentId, bookId, chapterOrder, part])
)
