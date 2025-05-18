import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(topics)) from (
      select bcct.*, ct2.level, ct2.order, ct2.topic, ct.is_mastered
      from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
        left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join student_book_content_course_topics bcct on bcct.student_book_content_id = sbcc.id
        left join student_course_topics ct on ct.id  = bcct.student_course_topic_id
        left join course_topics ct2 on ct2.id = ct.original_course_topic_id
        where sb.book_id = ?
        and sb.student_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
        ${filterByCourse(studentCourse?.id)}
    ) as topics
  ) as topics`, [bookId, studentId, chapterOrder, part])
)
