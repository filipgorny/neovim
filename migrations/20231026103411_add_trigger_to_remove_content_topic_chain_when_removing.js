exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
    CREATE OR REPLACE FUNCTION get_next_sibling_or_higher_level_relative_order(id_arg UUID)
    RETURNS int4 AS $$
    declare 
      result int4;
    BEGIN
        result := (select ct."order"
          from book_content_course_topics bcct 
          left join course_topics ct on bcct.course_topic_id = ct.id 
          where bcct.book_content_id = (select book_content_id from book_content_course_topics where id = id_arg)
            and "order" > (select ct."order" from book_content_course_topics bcct left join course_topics ct on bcct.course_topic_id = ct.id where bcct.id = id_arg)
            and "level" <= (select ct."level" from book_content_course_topics bcct left join course_topics ct on bcct.course_topic_id = ct.id where bcct.id = id_arg)
          and bcct.course_id = (select course_id from book_content_course_topics where id = id_arg)
          order by "order"
        limit 1);
      if result is null then
        return 2147483647;
      else
        return result;
      end if;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_next_sibling_or_higher_level_relative_order_by_deleted_record(book_content_id_arg UUID, course_topic_id_arg UUID, course_id_arg UUID)
    RETURNS int4 AS $$
    declare 
      result int4;
    BEGIN
        result := (select ct."order"
          from book_content_course_topics bcct 
          left join course_topics ct on bcct.course_topic_id = ct.id 
          where bcct.book_content_id = book_content_id_arg
            and "order" > (select ct."order" from course_topics ct where ct.id = course_topic_id_arg)
            and "level" <= (select ct."level" from course_topics ct where ct.id = course_topic_id_arg)
          and bcct.course_id = course_id_arg
          order by "order"
        limit 1);
      if result is null then
        return 2147483647;
      else
        return result;
      end if;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_content_topic_children(id_arg UUID)
    returns setof book_content_course_topics AS $$
    BEGIN
      return query 
        select bcct.*
        from book_content_course_topics bcct
        left join course_topics ct on bcct.course_topic_id = ct.id 
        where bcct.book_content_id = (select book_content_id from book_content_course_topics bcct where bcct.id = id_arg)
          and "order" > (select ct."order" from book_content_course_topics bcct left join course_topics ct on bcct.course_topic_id = ct.id where bcct.id = id_arg)
          and "order" < get_next_sibling_or_higher_level_relative_order(id_arg)
          and bcct.course_id = (select course_id from book_content_course_topics where id = id_arg)
        order by "order";
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_content_topic_children_by_deleted_record(book_content_id_arg UUID, course_topic_id_arg UUID, course_id_arg UUID)
    returns setof book_content_course_topics AS $$
    BEGIN
      return query 
        select bcct.*
        from book_content_course_topics bcct
        left join course_topics ct on bcct.course_topic_id = ct.id 
        where bcct.book_content_id = book_content_id_arg
          and "order" > (select ct."order" from course_topics ct where ct.id = course_topic_id_arg)
          and "order" < get_next_sibling_or_higher_level_relative_order_by_deleted_record(book_content_id_arg, course_topic_id_arg, course_id_arg)
          and bcct.course_id = course_id_arg
        order by "order";
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION content_topic_has_non_artificial_children(id_arg UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
      return exists (select * from get_content_topic_children(id_arg) t where t.is_artificial = false);
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_parent_content_topic(id_arg UUID)
    RETURNS UUID AS $$
    BEGIN
      return (
          select bcct.id
          from book_content_course_topics bcct 
          left join course_topics ct on bcct.course_topic_id = ct.id 
          where bcct.book_content_id = (select book_content_id from book_content_course_topics bcct where bcct.id = id_arg)
            and "order" < (select ct."order" from book_content_course_topics bcct left join course_topics ct on bcct.course_topic_id = ct.id where bcct.id = id_arg)
            and "level" < (select ct."level" from book_content_course_topics bcct left join course_topics ct on bcct.course_topic_id = ct.id where bcct.id = id_arg)
            and bcct.course_id = (select course_id from book_content_course_topics where id = id_arg)
          order by "order" desc 
          limit 1
      );
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_parent_content_topic_by_deleted_record(book_content_id_arg UUID, course_topic_id_arg UUID, course_id_arg UUID)
    RETURNS UUID AS $$
    BEGIN
      return (
          select bcct.id
          from book_content_course_topics bcct 
          left join course_topics ct on bcct.course_topic_id = ct.id 
          where bcct.book_content_id = book_content_id_arg
            and "order" < (select ct."order" from course_topics ct where ct.id = course_topic_id_arg)
            and "level" < (select ct."level" from course_topics ct where ct.id = course_topic_id_arg)
            and bcct.course_id = course_id_arg
          order by "order" desc 
          limit 1
      );
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION remove_artificial_content_topic_and_parents(id_arg UUID)
    RETURNS void AS $$
    declare 
      parent_id UUID;
    begin
      if id_arg is not null and content_topic_has_non_artificial_children(id_arg) = false then
        parent_id := get_parent_content_topic(id_arg);
        delete from book_content_course_topics where id = id_arg;
        perform remove_artificial_content_topic_and_parents(parent_id);
      end if;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION remove_children_content_topics_by_deleted_record(book_content_id UUID, course_topic_id UUID, course_id UUID)
    RETURNS void AS $$
    declare
      content_topic_id UUID;
    begin
      for content_topic_id in (select id from get_content_topic_children_by_deleted_record(book_content_id, course_topic_id, course_id))
      loop
          delete from book_content_course_topics where id = content_topic_id and is_artificial = false;
      end loop;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION remove_children_content_topics(id_arg UUID)
    RETURNS void AS $$
    declare
      content_topic_id UUID;
    BEGIN
      for content_topic_id in (select id from get_content_topic_children(id_arg))
      loop
        delete from book_content_course_topics where id = content_topic_id and is_artificial = false;
      end loop;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION remove_chain_of_content_topics()
    RETURNS TRIGGER AS $$
    begin
      if old.is_artificial = false then
        perform remove_artificial_content_topic_and_parents(get_parent_content_topic_by_deleted_record(old.book_content_id, old.course_topic_id, old.course_id));
      else 
        perform remove_children_content_topics_by_deleted_record(old.book_content_id, old.course_topic_id, old.course_id);
      end if;
      RETURN OLD;
    END;
    $$
    LANGUAGE plpgsql;

    CREATE TRIGGER remove_chain_of_content_topics
    AFTER DELETE ON book_content_course_topics
    FOR EACH ROW
    EXECUTE FUNCTION remove_chain_of_content_topics();
  `)
)

const down = async knex => (
  knex.raw(`
    DROP TRIGGER remove_chain_of_content_topics
    ON book_content_course_topics;

    DROP FUNCTION IF EXISTS remove_chain_of_content_topics;
    DROP FUNCTION IF EXISTS remove_children_content_topics;
    DROP FUNCTION IF EXISTS remove_children_content_topics_by_deleted_record;
    DROP FUNCTION IF EXISTS remove_artificial_content_topic_and_parents;
    DROP FUNCTION IF EXISTS get_parent_content_topic_by_deleted_record;
    DROP FUNCTION IF EXISTS get_parent_content_topic;
    DROP FUNCTION IF EXISTS content_topic_has_non_artificial_children;
    DROP FUNCTION IF EXISTS get_content_topic_children_by_deleted_record;
    DROP FUNCTION IF EXISTS get_content_topic_children;
    DROP FUNCTION IF EXISTS get_next_sibling_or_higher_level_relative_order_by_deleted_record;
    DROP FUNCTION IF EXISTS get_next_sibling_or_higher_level_relative_order;
  `)
)
