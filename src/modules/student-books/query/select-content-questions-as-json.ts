import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(content_questions)) from (
      select * from (
        select ROW_NUMBER() over (partition by sb.id order by sbc.order, sbs.order, bcq.subchapter_order) as number, sbcq.*, sbc.order as chapter_order, sbs.part, q.difficulty_percentage
        from student_books sb
          left join student_book_chapters sbc on sbc.book_id = sb.id
          left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
          left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
          left join student_book_content_questions sbcq on sbcq.content_id = sbcc.id
          left join book_content_questions bcq on bcq.content_id = sbcc.original_content_id
          left join questions q on bcq.question_id = q.id
        where sb.student_id = ?
          and sb.book_id = ?
          and sb.deleted_at is null
          and sbcq.id is not null
          ${filterByCourse(studentCourse?.id)}
      ) as content_questions
      where
        content_questions.chapter_order = ?
        and content_questions.part = ?
    ) as content_questions
  ) as content_questions`, [studentId, bookId, chapterOrder, part])
)
