export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(resources)) from (
      select sbcr.*, 
        v.id as video_id,
        v.title as video_title,
        v.description as video_description,
        v.source as video_source,
        v.thumbnail as video_thumbnail,
        v.duration as video_duration,
        v.category as video_category,
        v.rating as video_rating,
        v.fake_rating as video_fake_rating,
        v.source_no_bg_music as video_source_no_bg_music,
        v.use_fake_rating as video_use_fake_rating
      from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_subchapters sbs on sbs.chapter_id = sbc.id
        left join book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join book_content_resources sbcr on sbcr.content_id = sbcc.id
        left join videos v on sbcr.external_id = v.id
      where sb.id = ?
        and sbs.deleted_at is null
        and sbcc.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
    ) as resources
  ) as resources`, [bookId, chapterOrder, part])
)
