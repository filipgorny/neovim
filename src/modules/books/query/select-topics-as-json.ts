export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(topics)) from (
      select bcct.*, ct.level, ct.order, ct.topic
      from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_subchapters sbs on sbs.chapter_id = sbc.id
        left join book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join book_content_course_topics bcct on bcct.book_content_id = sbcc.id
        left join course_topics ct on ct.id = bcct.course_topic_id
        left join courses c on c.id = ct.course_id
      where sb.id = ?
        and sbs.deleted_at is null
        and sbcc.deleted_at is null
        and c.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
    ) as topics
  ) as topics`, [bookId, chapterOrder, part])
)
