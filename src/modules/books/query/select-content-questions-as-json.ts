export default (bookId, chapterOrder, part) => knex => (
  knex.raw(`(
    select json_agg(row_to_json(content_questions)) from (
      select * from (
        select
          ROW_NUMBER() over (partition by sb.id order by sbc.order, sbs.order, sbcq.subchapter_order) as number,
          ROW_NUMBER() over (partition by sbs.id order by sbcc.order, sbcq.order) as number_in_subchapter,
          sbcq.id,
          sbcq.content_id,
          sbcq.order,
          sbcq.subchapter_order as question_order_in_subchapter,
          sbc.order as chapter_order,
          sbs.order as subchapter_order,
          sbs.part,
          q.id as question_id,
          q.answer_definition,
          q.type,
          q.correct_answers,
          q.question_content_delta_object as question_content,
          q.question_content_raw,
          q.explanation_delta_object as explanation,
          q.explanation_raw,
          q.difficulty_percentage,
          (
            select json_agg(row_to_json(tags)) from (
              select 
                bo.tag, 
                bo.tag_colour,
                bo.id as book_id,
                bo.title as book_title,
                bocc.id as chapter_id,
                bocc."order" as chapter_order,
                bos.part,
                bos.id as subchapter_id,
                bos."order" as subchapter_order,
                bos.title as subchapter_title,
                boc.id as content_id,
                boc."order" as content_order
              from books bo
                left join book_chapters bocc on bocc.book_id = bo.id
                left join book_subchapters bos on bos.chapter_id = bocc.id 
                left join book_contents boc on boc.subchapter_id = bos.id 
                left join book_content_questions bocq on bocq.content_id = boc.id 
              where bocq.question_id = q.id
                and bos.deleted_at is null
                and boc.deleted_at is null
                and bo.is_archived = false
                ) as tags
          ) as tags
        from books sb
          left join book_chapters sbc on sbc.book_id = sb.id
          left join book_subchapters sbs on sbs.chapter_id = sbc.id
          left join book_contents sbcc on sbcc.subchapter_id = sbs.id
          left join book_content_questions sbcq on sbcq.content_id = sbcc.id
          left join questions q on q.id = sbcq.question_id
        where sb.id = ?
          and sbs.deleted_at is null
          and sbcc.deleted_at is null
          and q.deleted_at is null
          and sbcq.id is not null
          and q.id is not null
      ) as content_questions
      where
        content_questions.chapter_order = ?
        and content_questions.part = ?
    ) as content_questions
  ) as content_questions`, [bookId, chapterOrder, part])
)
