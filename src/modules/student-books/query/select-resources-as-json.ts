import { filterByCourse } from '../helpers/filter-by-course'

export default (studentId, bookId, chapterOrder, part, studentCourse) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(resources)) from (
      select sbcr.*, 
        v.id as video_id,
        v.title as video_title,
        v.description as video_description,
        v.source as video_source,
        v.thumbnail as video_thumbnail,
        v.duration as video_duration,
        v.source_no_bg_music as video_source_no_bg_music
      from student_books sb
        left join student_book_chapters sbc on sbc.book_id = sb.id
        left join student_book_subchapters sbs on sbs.chapter_id = sbc.id
        left join student_book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join student_book_content_resources sbcr on sbcr.content_id = sbcc.id
        left join videos v on sbcr.external_id = v.id
      where sb.student_id = ?
        and sb.book_id = ?
        and sb.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
        ${filterByCourse(studentCourse?.id)}
    ) as resources
  ) as resources`, [studentId, bookId, chapterOrder, part])
)
