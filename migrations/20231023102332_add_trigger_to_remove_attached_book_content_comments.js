exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
    CREATE OR REPLACE FUNCTION remove_course_topic_comment_if_no_topics_attached()
    RETURNS TRIGGER AS $$
    BEGIN
      if exists (select * from book_content_comments where book_content_id = old.book_content_id and course_id = old.course_id)
        and 0 = (select count(*) from book_content_course_topics where book_content_id = old.book_content_id and course_id = old.course_id)
      then
      delete from book_content_comments where book_content_id = old.book_content_id and course_id = old.course_id;
      end if;
      RETURN OLD;
    END;
    $$
    LANGUAGE plpgsql;
    
    CREATE TRIGGER remove_course_topic_comment_if_no_topics_attached
    AFTER DELETE ON book_content_course_topics
    FOR EACH ROW
    EXECUTE FUNCTION remove_course_topic_comment_if_no_topics_attached();
  `)
)

const down = async knex => (
  knex.raw(`
    DROP TRIGGER remove_course_topic_comment_if_no_topics_attached
    ON book_content_course_topics;

    DROP FUNCTION IF EXISTS remove_course_topic_comment_if_no_topics_attached;
  `)
)
