export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(flashcards)) from (
      select f.*, sbcf.content_id as content_id
      from books sb
        left join book_chapters sbc on sbc.book_id = sb.id
        left join book_subchapters sbs on sbs.chapter_id = sbc.id
        left join book_contents sbcc on sbcc.subchapter_id = sbs.id
        left join book_content_flashcards sbcf on sbcf.content_id = sbcc.id
        left join flashcards f on sbcf.flashcard_id = f.id
      where sb.id = ?
        and sbs.deleted_at is null
        and sbcc.deleted_at is null
        and sbc.order = ?
        and sbs.part = ?
    ) as flashcards
  ) as flashcards`, [bookId, chapterOrder, part])
)
