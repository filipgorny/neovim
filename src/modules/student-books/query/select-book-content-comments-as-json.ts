export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(book_content_comments)) from (
      select sb.id, sbcc.* from student_book_content_comments sbcc 
        left join student_book_contents sbc on sbc.original_content_id  = sbcc.original_book_content_id 
        left join student_book_subchapters sbs on sbs.id = sbc.subchapter_id 
        left join student_book_chapters sbc2 on sbc2.id = sbs.chapter_id 
        left join student_books sb on sb.id = sbc2.book_id 
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        and sbc2.order = ?
        and sbs.part = ?
        and sbcc.student_course_id = ?
    ) as book_content_comments
  ) as book_content_comments`, [studentId, bookId, chapterOrder, part, studentCourse ? studentCourse.id : null])
)
