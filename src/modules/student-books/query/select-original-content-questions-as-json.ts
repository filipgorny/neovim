import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => {
  console.log(studentId, bookId, chapterOrder, part)
  /**
   * Sit down with Sandra to this and prepare some questions so they should show in the student book
   */
  return knex.raw(`(
    select json_agg(row_to_json(original_content_questions)) from (
      select * from (
        select ROW_NUMBER() over (partition by b.id order by bc.order, bs.order, bcq.subchapter_order) as number, bcq.*, bc.order as chapter_order, bs.part, q.difficulty_percentage, bcq.id as book_content_question_id, q.question_content_delta_object as question, q.explanation_delta_object as explanation, q.answer_definition, q.correct_answers
        from books b
          left join book_chapters bc on bc.book_id = b.id
          left join book_subchapters bs on bs.chapter_id = bc.id
          left join book_contents bcc on bcc.subchapter_id = bs.id
          left join book_content_questions bcq on bcq.content_id = bcc.id
          left join questions q on bcq.question_id = q.id
        where b.id = ?
          and b.deleted_at is null
          and bcq.id is not null
      ) as original_content_questions
      where
        original_content_questions.chapter_order = ?
        and original_content_questions.part = ?
    ) as original_content_questions
  ) as original_content_questions`, [bookId, chapterOrder, part])
}
