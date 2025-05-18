-- NOTE This is a schema-only dump of Fen's local database.
-- The existing migrations were broken due to a tuple index error and the logs were unhelpful in
-- resolving that issue, so we're using this to emulate Laravel's
-- ["Squashing Migrations" feature](https://laravel.com/docs/11.x/migrations#squashing-migrations).


--
-- PostgreSQL database dump
--

-- Dumped from database version 12.7 (Debian 12.7-1.pgdg100+1)
-- Dumped by pg_dump version 14.12 (Ubuntu 14.12-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: check_external_id(text, text); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.check_external_id(id text, external_id text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN id = any(string_to_array(external_id, ','));
    END;
    $$;


ALTER FUNCTION public.check_external_id(id text, external_id text) OWNER TO examkrackers_api;

--
-- Name: content_topic_has_non_artificial_children(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.content_topic_has_non_artificial_children(id_arg uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    BEGIN
      return exists (select * from get_content_topic_children(id_arg) t where t.is_artificial = false);
    END;
    $$;


ALTER FUNCTION public.content_topic_has_non_artificial_children(id_arg uuid) OWNER TO examkrackers_api;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: book_content_course_topics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_course_topics (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    book_id uuid NOT NULL,
    book_content_id uuid NOT NULL,
    course_topic_id uuid NOT NULL,
    is_artificial boolean DEFAULT false,
    comment_html text,
    comment_raw text,
    comment_delta_object text
);


ALTER TABLE public.book_content_course_topics OWNER TO examkrackers_api;

--
-- Name: get_content_topic_children(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_content_topic_children(id_arg uuid) RETURNS SETOF public.book_content_course_topics
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_content_topic_children(id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_content_topic_children_by_deleted_record(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_content_topic_children_by_deleted_record(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) RETURNS SETOF public.book_content_course_topics
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_content_topic_children_by_deleted_record(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_next_sibling_or_higher_level_relative_order(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_next_sibling_or_higher_level_relative_order(id_arg uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_next_sibling_or_higher_level_relative_order(id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_next_sibling_or_higher_level_relative_order_by_deleted_reco(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_next_sibling_or_higher_level_relative_order_by_deleted_reco(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_next_sibling_or_higher_level_relative_order_by_deleted_reco(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_parent_content_topic(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_parent_content_topic(id_arg uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_parent_content_topic(id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_parent_content_topic_by_deleted_record(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_parent_content_topic_by_deleted_record(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.get_parent_content_topic_by_deleted_record(book_content_id_arg uuid, course_topic_id_arg uuid, course_id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: get_student_course_id_by_student_book_content_id(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_student_course_id_by_student_book_content_id(content_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
    begin
      return (
        select sc.id from student_book_contents sbc
        left join student_book_subchapters sbs on sbc.subchapter_id = sbs.id
        left join student_book_chapters sbc2 on sbs.chapter_id = sbc2.id
        left join student_books sb on sbc2.book_id = sb.id
        left join student_courses sc on sb.course_id = sc.id
        where sbc.id = content_id
      );
    end;
    $$;


ALTER FUNCTION public.get_student_course_id_by_student_book_content_id(content_id uuid) OWNER TO examkrackers_api;

--
-- Name: get_target_student_courses(text, uuid, text, uuid, text); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_target_student_courses(course_type text, course_id_arg uuid, days_amount_arg text DEFAULT NULL::text, end_date_id_arg uuid DEFAULT NULL::uuid, expires_at text DEFAULT NULL::text) RETURNS TABLE(student_id uuid, student_course_id uuid)
    LANGUAGE plpgsql
    AS $$
    begin
      if course_type = 'on_demand' then
        if days_amount_arg is null then
          return query select sc.student_id, sc.id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg;
        else
          return query select sc.student_id, sc.id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata like '%"days_amount":"' || days_amount_arg || '"%';
        end if;
      else
        if end_date_id_arg is null then
          if expires_at is null then
            return query select sc.student_id, sc.id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg;
          else
            return query select sc.student_id, sc.id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata like '%"expires_at":"' || expires_at || '"%';
          end if;
        else
            return query select sc.student_id, sc.id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.end_date_id = end_date_id_arg;
        end if;
        end if;
    end;
    $$;


ALTER FUNCTION public.get_target_student_courses(course_type text, course_id_arg uuid, days_amount_arg text, end_date_id_arg uuid, expires_at text) OWNER TO examkrackers_api;

--
-- Name: get_target_students(text, uuid, text, uuid, text); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.get_target_students(course_type text, course_id_arg uuid, days_amount_arg text DEFAULT NULL::text, end_date_id_arg uuid DEFAULT NULL::uuid, expires_at text DEFAULT NULL::text) RETURNS TABLE(student_id uuid)
    LANGUAGE plpgsql
    AS $$
    begin
      if course_type = 'on_demand' then
        if days_amount_arg is null then
          return query select sc.student_id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg;
        else
          return query select sc.student_id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata like '%"days_amount":"' || days_amount_arg || '"%';
        end if;
      else
        if end_date_id_arg is null then
          if expires_at is null then
            return query select sc.student_id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg;
          else
            return query select sc.student_id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata like '%"expires_at":"' || expires_at || '"%';
          end if;
        else
            return query select sc.student_id from student_courses sc where sc.accessible_to > NOW() and sc.status = 'ongoing' and sc."type" = course_type and sc.book_course_id = course_id_arg and sc.end_date_id = end_date_id_arg;
        end if;
        end if;
    end;
    $$;


ALTER FUNCTION public.get_target_students(course_type text, course_id_arg uuid, days_amount_arg text, end_date_id_arg uuid, expires_at text) OWNER TO examkrackers_api;

--
-- Name: remove_artificial_content_topic_and_parents(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_artificial_content_topic_and_parents(id_arg uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
    declare
      parent_id UUID;
    begin
      if id_arg is not null and content_topic_has_non_artificial_children(id_arg) = false then
        parent_id := get_parent_content_topic(id_arg);
        delete from book_content_course_topics where id = id_arg;
        perform remove_artificial_content_topic_and_parents(parent_id);
      end if;
    END;
    $$;


ALTER FUNCTION public.remove_artificial_content_topic_and_parents(id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: remove_attached_exam(); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_attached_exam() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      DELETE FROM student_exams WHERE id = OLD.exam_id;
      RETURN OLD;
    END;
    $$;


ALTER FUNCTION public.remove_attached_exam() OWNER TO examkrackers_api;

--
-- Name: remove_chain_of_content_topics(); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_chain_of_content_topics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    begin
      if old.is_artificial = false then
        perform remove_artificial_content_topic_and_parents(get_parent_content_topic_by_deleted_record(old.book_content_id, old.course_topic_id, old.course_id));
      else
        perform remove_children_content_topics_by_deleted_record(old.book_content_id, old.course_topic_id, old.course_id);
      end if;
      RETURN OLD;
    END;
    $$;


ALTER FUNCTION public.remove_chain_of_content_topics() OWNER TO examkrackers_api;

--
-- Name: remove_children_content_topics(uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_children_content_topics(id_arg uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
    declare
      content_topic_id UUID;
    BEGIN
      for content_topic_id in (select id from get_content_topic_children(id_arg))
      loop
        delete from book_content_course_topics where id = content_topic_id and is_artificial = false;
      end loop;
    END;
    $$;


ALTER FUNCTION public.remove_children_content_topics(id_arg uuid) OWNER TO examkrackers_api;

--
-- Name: remove_children_content_topics_by_deleted_record(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_children_content_topics_by_deleted_record(book_content_id uuid, course_topic_id uuid, course_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
    declare
      content_topic_id UUID;
    begin
      for content_topic_id in (select id from get_content_topic_children_by_deleted_record(book_content_id, course_topic_id, course_id))
      loop
          delete from book_content_course_topics where id = content_topic_id and is_artificial = false;
      end loop;
    END;
    $$;


ALTER FUNCTION public.remove_children_content_topics_by_deleted_record(book_content_id uuid, course_topic_id uuid, course_id uuid) OWNER TO examkrackers_api;

--
-- Name: remove_course_topic_comment_if_no_topics_attached(); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.remove_course_topic_comment_if_no_topics_attached() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      if exists (select * from book_content_comments where book_content_id = old.book_content_id and course_id = old.course_id)
        and 0 = (select count(*) from book_content_course_topics where book_content_id = old.book_content_id and course_id = old.course_id)
      then
      delete from book_content_comments where book_content_id = old.book_content_id and course_id = old.course_id;
      end if;
      RETURN OLD;
    END;
    $$;


ALTER FUNCTION public.remove_course_topic_comment_if_no_topics_attached() OWNER TO examkrackers_api;

--
-- Name: send_notification(uuid, uuid, text, uuid, text, uuid, text); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.send_notification(author_id_arg uuid, notification_id_arg uuid, course_type text DEFAULT NULL::text, course_id_arg uuid DEFAULT NULL::uuid, days_amount_arg text DEFAULT NULL::text, end_date_id_arg uuid DEFAULT NULL::uuid, expires_at text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
    declare
        student_id uuid;
        student_course_id uuid;
    begin
      if course_type is null then
        for student_id in (select id from students where deleted_at is null and has_courses = true and is_active = true)
        loop
          insert into student_notifications (id, author_id, created_at, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), student_id, null, notification_id_arg);
        end loop;
      else
        for student_id, student_course_id in (select * from get_target_student_courses(course_type, course_id_arg, days_amount_arg, end_date_id_arg, expires_at))
        loop
          insert into student_notifications (id, author_id, created_at, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), student_id, student_course_id, notification_id_arg);
        end loop;
      end if;
    end;
    $$;


ALTER FUNCTION public.send_notification(author_id_arg uuid, notification_id_arg uuid, course_type text, course_id_arg uuid, days_amount_arg text, end_date_id_arg uuid, expires_at text) OWNER TO examkrackers_api;

--
-- Name: set_is_paused_for_notification(); Type: FUNCTION; Schema: public; Owner: examkrackers_api
--

CREATE FUNCTION public.set_is_paused_for_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.type <> 'immediate' THEN
        IF NEW.is_paused IS NULL THEN
          NEW.is_paused := FALSE;
        END IF;
      ELSE
        NEW.is_paused := NULL;
      END IF;
      RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.set_is_paused_for_notification() OWNER TO examkrackers_api;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.admins (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    admin_role character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    deleted_at timestamp with time zone,
    password_reset_token character varying(255),
    password_reset_token_created_at timestamp with time zone,
    name character varying(255),
    created_at timestamp with time zone,
    can_manage_glossary boolean DEFAULT false NOT NULL,
    can_manage_flashcards boolean DEFAULT false NOT NULL,
    can_manage_videos boolean DEFAULT false NOT NULL,
    can_manage_content_questions boolean DEFAULT false NOT NULL,
    can_manage_exams boolean DEFAULT false NOT NULL,
    can_manage_students boolean DEFAULT false NOT NULL,
    can_manage_courses boolean DEFAULT false NOT NULL,
    can_manage_animations boolean DEFAULT false NOT NULL,
    can_manage_score_tables boolean DEFAULT false NOT NULL,
    can_manage_notifications boolean DEFAULT false NOT NULL,
    can_manage_course_topics boolean DEFAULT false NOT NULL
);


ALTER TABLE public.admins OWNER TO examkrackers_api;

--
-- Name: amino_acid_games; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.amino_acid_games (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    score integer NOT NULL,
    correct_amount integer NOT NULL,
    incorrect_amount integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    answers text,
    blox_game_enabled boolean,
    acid_names_difficulty character varying(255),
    is_a_win boolean DEFAULT false NOT NULL,
    is_paused boolean DEFAULT false NOT NULL
);


ALTER TABLE public.amino_acid_games OWNER TO examkrackers_api;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.app_settings (
    id uuid NOT NULL,
    namespace character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.app_settings OWNER TO examkrackers_api;

--
-- Name: attached_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.attached_exams (
    id uuid NOT NULL,
    attached_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    is_free_trial boolean DEFAULT false
);


ALTER TABLE public.attached_exams OWNER TO examkrackers_api;

--
-- Name: auth_debug; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.auth_debug (
    id uuid NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auth_debug OWNER TO examkrackers_api;

--
-- Name: book_admins; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_admins (
    id uuid NOT NULL,
    admin_id uuid,
    book_id uuid,
    permission character varying(255)
);


ALTER TABLE public.book_admins OWNER TO examkrackers_api;

--
-- Name: book_chapter_images; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_chapter_images (
    id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    image character varying(255),
    small_ver character varying(255),
    "order" integer NOT NULL
);


ALTER TABLE public.book_chapter_images OWNER TO examkrackers_api;

--
-- Name: book_chapters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_chapters (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    book_id uuid NOT NULL,
    "order" integer NOT NULL,
    deleted_at timestamp with time zone,
    image_tab_title character varying(255),
    was_manually_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.book_chapters OWNER TO examkrackers_api;

--
-- Name: book_content_attachments; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_attachments (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    raw text NOT NULL,
    "order" integer NOT NULL,
    type character varying(255),
    delta_object text
);


ALTER TABLE public.book_content_attachments OWNER TO examkrackers_api;

--
-- Name: book_content_comments; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_comments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    book_content_id uuid NOT NULL,
    comment_html text,
    comment_raw text,
    comment_delta_object text
);


ALTER TABLE public.book_content_comments OWNER TO examkrackers_api;

--
-- Name: book_content_flashcards; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_flashcards (
    content_id uuid NOT NULL,
    flashcard_id uuid NOT NULL
);


ALTER TABLE public.book_content_flashcards OWNER TO examkrackers_api;

--
-- Name: book_content_images; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_images (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    image character varying(255),
    "order" integer NOT NULL,
    small_ver character varying(255)
);


ALTER TABLE public.book_content_images OWNER TO examkrackers_api;

--
-- Name: book_content_questions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_questions (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    question_id uuid NOT NULL,
    "order" integer NOT NULL,
    subchapter_order integer,
    subchapter_id uuid
);


ALTER TABLE public.book_content_questions OWNER TO examkrackers_api;

--
-- Name: book_content_resources; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_content_resources (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    "order" integer NOT NULL,
    type character varying(255) NOT NULL,
    raw text,
    delta_object text,
    external_id uuid
);


ALTER TABLE public.book_content_resources OWNER TO examkrackers_api;

--
-- Name: book_contents; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_contents (
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    subchapter_id uuid NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    raw text,
    delta_object text,
    deleted_at timestamp with time zone,
    was_manually_deleted boolean DEFAULT false NOT NULL,
    content_html text
);


ALTER TABLE public.book_contents OWNER TO examkrackers_api;

--
-- Name: book_erratas; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_erratas (
    id uuid NOT NULL,
    book_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    subchapter_id uuid NOT NULL,
    type character varying(255) DEFAULT 'text'::character varying NOT NULL,
    content_delta_object text NOT NULL,
    content_raw text NOT NULL,
    content_html text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    book_content_id uuid
);


ALTER TABLE public.book_erratas OWNER TO examkrackers_api;

--
-- Name: book_subchapters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.book_subchapters (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    chapter_id uuid NOT NULL,
    "order" integer NOT NULL,
    part integer DEFAULT 1,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    was_manually_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.book_subchapters OWNER TO examkrackers_api;

--
-- Name: books; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.books (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tag character varying(255),
    tag_colour character varying(255),
    external_id character varying(255),
    image_url text,
    deleted_at timestamp with time zone,
    is_archived boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    chapter_heading_image_url character varying(255),
    flashcards_accessible boolean DEFAULT true NOT NULL,
    is_test_bundle boolean DEFAULT false,
    header_abbreviation text
);


ALTER TABLE public.books OWNER TO examkrackers_api;

--
-- Name: book_scan_list_view; Type: VIEW; Schema: public; Owner: examkrackers_api
--

CREATE VIEW public.book_scan_list_view AS
 SELECT bc.id,
    bc.raw,
    bc.delta_object,
    'book_content'::text AS type,
    b.id AS book_id,
    b.title AS book_title,
    b.tag AS book_tag,
    b.tag_colour AS book_tag_colour,
    bcc."order" AS chapter_order,
    bs.part,
    bs."order" AS subchapter_order,
    bs.title AS subchapter_title,
    bc."order" AS content_order,
    NULL::integer AS resource_order
   FROM (((public.book_contents bc
     LEFT JOIN public.book_subchapters bs ON ((bs.id = bc.subchapter_id)))
     LEFT JOIN public.book_chapters bcc ON ((bcc.id = bs.chapter_id)))
     LEFT JOIN public.books b ON ((b.id = bcc.book_id)))
  WHERE ((bc.deleted_at IS NULL) AND ((bc.type)::text = ANY ((ARRAY['main_text'::character varying, 'salty_comment'::character varying])::text[])))
UNION
 SELECT bcr.id,
    bcr.raw,
    bcr.delta_object,
    'book_content_resource'::text AS type,
    b.id AS book_id,
    b.title AS book_title,
    b.tag AS book_tag,
    b.tag_colour AS book_tag_colour,
    bcc."order" AS chapter_order,
    bs.part,
    bs."order" AS subchapter_order,
    bs.title AS subchapter_title,
    bc."order" AS content_order,
    bcr."order" AS resource_order
   FROM ((((public.book_content_resources bcr
     LEFT JOIN public.book_contents bc ON ((bc.id = bcr.content_id)))
     LEFT JOIN public.book_subchapters bs ON ((bs.id = bc.subchapter_id)))
     LEFT JOIN public.book_chapters bcc ON ((bcc.id = bs.chapter_id)))
     LEFT JOIN public.books b ON ((b.id = bcc.book_id)))
  WHERE ((bc.deleted_at IS NULL) AND ((bcr.type)::text = ANY ((ARRAY['clinical_context'::character varying, 'mcat_think'::character varying, 'tmi'::character varying])::text[])));


ALTER TABLE public.book_scan_list_view OWNER TO examkrackers_api;

--
-- Name: calendar_chapter_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.calendar_chapter_exams (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    exam_id uuid NOT NULL
);


ALTER TABLE public.calendar_chapter_exams OWNER TO examkrackers_api;

--
-- Name: calendar_chapters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.calendar_chapters (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.calendar_chapters OWNER TO examkrackers_api;

--
-- Name: calendar_full_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.calendar_full_exams (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.calendar_full_exams OWNER TO examkrackers_api;

--
-- Name: calendar_section_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.calendar_section_exams (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.calendar_section_exams OWNER TO examkrackers_api;

--
-- Name: calendar_settings; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.calendar_settings (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    preferred_days_full_length_exam json,
    preferred_days_section_exam json,
    full_length_exam_frequency character varying(255),
    section_exam_frequency character varying(255),
    chapter_exam_delay integer DEFAULT 0,
    preferred_days_chapters json
);


ALTER TABLE public.calendar_settings OWNER TO examkrackers_api;

--
-- Name: chapter_admins; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.chapter_admins (
    admin_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    book_id uuid NOT NULL
);


ALTER TABLE public.chapter_admins OWNER TO examkrackers_api;

--
-- Name: chat_chapter_scores; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.chat_chapter_scores (
    id uuid NOT NULL,
    student_id uuid,
    student_book_chapter_id uuid,
    chapter_avg_score integer DEFAULT 0,
    chapter_score_sum integer DEFAULT 0,
    chapter_score_amount integer DEFAULT 0
);


ALTER TABLE public.chat_chapter_scores OWNER TO examkrackers_api;

--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.chat_history (
    id uuid NOT NULL,
    student_id uuid,
    context_id uuid,
    role character varying(255) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    student_book_chapter_id uuid NOT NULL,
    message_raw text
);


ALTER TABLE public.chat_history OWNER TO examkrackers_api;

--
-- Name: content_question_reactions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.content_question_reactions (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    animation character varying(255) NOT NULL,
    sound character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_question_reactions OWNER TO examkrackers_api;

--
-- Name: course_books; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_books (
    course_id uuid NOT NULL,
    book_id uuid NOT NULL,
    is_free_trial boolean DEFAULT false,
    free_trial_exam_id uuid
);


ALTER TABLE public.course_books OWNER TO examkrackers_api;

--
-- Name: course_end_date_days; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_end_date_days (
    id uuid NOT NULL,
    end_date_id uuid,
    class_time character varying(255) NOT NULL,
    class_time_end character varying(255),
    class_date date,
    class_topic character varying(255),
    class_topic_number character varying(255),
    meeting_url character varying(255),
    book_chapter_id uuid,
    exam_id uuid
);


ALTER TABLE public.course_end_date_days OWNER TO examkrackers_api;

--
-- Name: course_end_dates; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_end_dates (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    end_date timestamp with time zone,
    calendar_image_url text,
    start_date timestamp with time zone,
    meeting_url character varying(255)
);


ALTER TABLE public.course_end_dates OWNER TO examkrackers_api;

--
-- Name: course_extensions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_extensions (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    external_id character varying(255) NOT NULL,
    external_created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.course_extensions OWNER TO examkrackers_api;

--
-- Name: course_map; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_map (
    id uuid NOT NULL,
    book_course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    external_id character varying(255),
    type character varying(255),
    metadata text
);


ALTER TABLE public.course_map OWNER TO examkrackers_api;

--
-- Name: course_topics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.course_topics (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    topic character varying(255) NOT NULL,
    "order" integer,
    level integer
);


ALTER TABLE public.course_topics OWNER TO examkrackers_api;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    external_id text,
    course_topics_title character varying(255),
    group_tutoring_meeting_url character varying(255)
);


ALTER TABLE public.courses OWNER TO examkrackers_api;

--
-- Name: custom_event_groups; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.custom_event_groups (
    id uuid NOT NULL,
    course_id uuid,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    "order" integer NOT NULL,
    colour_gradient_start character varying(255) DEFAULT '#e0e0e0'::character varying,
    colour_gradient_end character varying(255) DEFAULT '#f0f0f0'::character varying,
    colour_font character varying(255) DEFAULT '#333333'::character varying
);


ALTER TABLE public.custom_event_groups OWNER TO examkrackers_api;

--
-- Name: custom_event_types; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.custom_event_types (
    id uuid NOT NULL,
    custom_event_group_id uuid,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    "order" integer NOT NULL,
    duration integer DEFAULT 375 NOT NULL
);


ALTER TABLE public.custom_event_types OWNER TO examkrackers_api;

--
-- Name: exam_erratas; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_erratas (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    content_delta_object text NOT NULL,
    content_raw text NOT NULL,
    content_html text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL
);


ALTER TABLE public.exam_erratas OWNER TO examkrackers_api;

--
-- Name: exam_intro_pages; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_intro_pages (
    id uuid NOT NULL,
    "order" integer NOT NULL,
    raw text,
    delta_object text NOT NULL,
    exam_type_id uuid NOT NULL
);


ALTER TABLE public.exam_intro_pages OWNER TO examkrackers_api;

--
-- Name: exam_logs; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_logs (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(255),
    content text
);


ALTER TABLE public.exam_logs OWNER TO examkrackers_api;

--
-- Name: exam_metrics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_metrics (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    section_order integer NOT NULL,
    section_score integer NOT NULL,
    timings text NOT NULL
);


ALTER TABLE public.exam_metrics OWNER TO examkrackers_api;

--
-- Name: exam_metrics_avg; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_metrics_avg (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    section_order integer NOT NULL,
    timings text NOT NULL
);


ALTER TABLE public.exam_metrics_avg OWNER TO examkrackers_api;

--
-- Name: exam_passage_metrics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_passage_metrics (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    section_order integer NOT NULL,
    section_score integer NOT NULL,
    timings text NOT NULL
);


ALTER TABLE public.exam_passage_metrics OWNER TO examkrackers_api;

--
-- Name: exam_passage_metrics_avg; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_passage_metrics_avg (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    section_order integer NOT NULL,
    timings text NOT NULL
);


ALTER TABLE public.exam_passage_metrics_avg OWNER TO examkrackers_api;

--
-- Name: exam_passage_time_metrics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_passage_time_metrics (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    exam_passage_id uuid NOT NULL,
    section_score integer NOT NULL,
    checking_sum integer,
    checking_divisor integer,
    checking_avg numeric(8,2),
    reading_sum integer,
    reading_divisor integer,
    reading_avg numeric(8,2),
    working_sum integer,
    working_divisor integer,
    working_avg numeric(8,2)
);


ALTER TABLE public.exam_passage_time_metrics OWNER TO examkrackers_api;

--
-- Name: exam_passages; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_passages (
    id uuid NOT NULL,
    section_id uuid NOT NULL,
    content text NOT NULL,
    "order" integer NOT NULL,
    is_false_passage boolean DEFAULT false,
    word_count integer,
    checking_sum integer,
    checking_divisor integer,
    checking_avg numeric(8,2),
    reading_sum integer,
    reading_divisor integer,
    reading_avg numeric(8,2),
    working_sum integer,
    working_divisor integer,
    working_avg numeric(8,2)
);


ALTER TABLE public.exam_passages OWNER TO examkrackers_api;

--
-- Name: exam_question_time_metrics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_question_time_metrics (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    exam_question_id uuid NOT NULL,
    section_score integer NOT NULL,
    checking_sum integer,
    checking_divisor integer,
    checking_avg numeric(8,2),
    reading_sum integer,
    reading_divisor integer,
    reading_avg numeric(8,2),
    working_sum integer,
    working_divisor integer,
    working_avg numeric(8,2)
);


ALTER TABLE public.exam_question_time_metrics OWNER TO examkrackers_api;

--
-- Name: exam_questions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_questions (
    id uuid NOT NULL,
    passage_id uuid NOT NULL,
    question_content text NOT NULL,
    answer_definition text NOT NULL,
    explanation text NOT NULL,
    chapter text,
    question_type character varying(255) NOT NULL,
    correct_answer character varying(255) NOT NULL,
    "order" integer NOT NULL,
    correct_answers_amount integer DEFAULT 0,
    all_answers_amount integer DEFAULT 0,
    difficulty_percentage real DEFAULT '0'::real,
    answer_distribution text,
    checking_sum integer,
    checking_divisor integer,
    checking_avg numeric(8,2),
    reading_sum integer,
    reading_divisor integer,
    reading_avg numeric(8,2),
    working_sum integer,
    working_divisor integer,
    working_avg numeric(8,2)
);


ALTER TABLE public.exam_questions OWNER TO examkrackers_api;

--
-- Name: exam_score_map; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_score_map (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    score smallint NOT NULL,
    student_amount integer NOT NULL,
    percentile_rank character varying(255) NOT NULL
);


ALTER TABLE public.exam_score_map OWNER TO examkrackers_api;

--
-- Name: exam_score_stats; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_score_stats (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    score smallint NOT NULL,
    student_count integer NOT NULL
);


ALTER TABLE public.exam_score_stats OWNER TO examkrackers_api;

--
-- Name: exam_scores; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_scores (
    id uuid NOT NULL,
    exam_id uuid,
    score integer NOT NULL,
    percentile_rank character varying(255) NOT NULL,
    percentage character varying(255) NOT NULL
);


ALTER TABLE public.exam_scores OWNER TO examkrackers_api;

--
-- Name: exam_section_score_map; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_section_score_map (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    section_id uuid NOT NULL,
    correct_answers smallint NOT NULL,
    score smallint NOT NULL,
    amount_correct integer NOT NULL,
    percentile_rank character varying(255) NOT NULL
);


ALTER TABLE public.exam_section_score_map OWNER TO examkrackers_api;

--
-- Name: exam_section_scores; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_section_scores (
    id uuid NOT NULL,
    section_id uuid,
    score integer NOT NULL,
    correct_answers integer NOT NULL,
    percentile_rank character varying(255) NOT NULL,
    percentage character varying(255) NOT NULL
);


ALTER TABLE public.exam_section_scores OWNER TO examkrackers_api;

--
-- Name: exam_sections; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_sections (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    "order" integer NOT NULL,
    full_title character varying(255),
    score_min integer,
    score_max integer
);


ALTER TABLE public.exam_sections OWNER TO examkrackers_api;

--
-- Name: exam_type_scaled_score_templates; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_type_scaled_score_templates (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    template_id uuid NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.exam_type_scaled_score_templates OWNER TO examkrackers_api;

--
-- Name: exam_types; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exam_types (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    break_definition text,
    type character varying(255) DEFAULT 'full'::character varying NOT NULL,
    subtype character varying(255) DEFAULT 'mcat'::character varying NOT NULL,
    section_count integer,
    question_amount text,
    score_calculations_enabled boolean DEFAULT false,
    exam_scaled_score_template text,
    exam_length text,
    deleted_at timestamp with time zone,
    section_titles text,
    scaled_score_ranges text,
    type_label character varying(255)
);


ALTER TABLE public.exam_types OWNER TO examkrackers_api;

--
-- Name: exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.exams (
    id uuid NOT NULL,
    layout_id uuid NOT NULL,
    title character varying(255),
    file_name character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    uploaded_by uuid NOT NULL,
    is_active boolean DEFAULT true,
    external_id character varying(255),
    access_period integer,
    exam_length text,
    deleted_at timestamp with time zone,
    exam_type_id uuid,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    google_form_url character varying(255),
    score_calculation_method character varying(255) DEFAULT 'normal'::character varying,
    periodic_table_enabled boolean DEFAULT true,
    review_video_id uuid,
    custom_title character varying(255)
);


ALTER TABLE public.exams OWNER TO examkrackers_api;

--
-- Name: favourite_videos; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.favourite_videos (
    id uuid NOT NULL,
    student_id uuid,
    video_id uuid
);


ALTER TABLE public.favourite_videos OWNER TO examkrackers_api;

--
-- Name: flashcard_activity_timers; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.flashcard_activity_timers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    flashcard_id uuid NOT NULL,
    seconds integer NOT NULL,
    activity_date date
);


ALTER TABLE public.flashcard_activity_timers OWNER TO examkrackers_api;

--
-- Name: flashcards; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.flashcards (
    id uuid NOT NULL,
    question text,
    explanation text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    question_image character varying(255),
    explanation_image character varying(255),
    deleted_at timestamp with time zone,
    raw_question text,
    raw_explanation text,
    code bigint,
    question_html text,
    explanation_html text,
    is_archived boolean DEFAULT false
);


ALTER TABLE public.flashcards OWNER TO examkrackers_api;

--
-- Name: flashcards_code_seq; Type: SEQUENCE; Schema: public; Owner: examkrackers_api
--

CREATE SEQUENCE public.flashcards_code_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.flashcards_code_seq OWNER TO examkrackers_api;

--
-- Name: flashcards_code_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: examkrackers_api
--

ALTER SEQUENCE public.flashcards_code_seq OWNED BY public.flashcards.code;


--
-- Name: flashcards_list_view; Type: VIEW; Schema: public; Owner: examkrackers_api
--

CREATE VIEW public.flashcards_list_view AS
 SELECT DISTINCT ON (f.id) f.id,
    f.question,
    f.explanation,
    f.created_at,
    f.question_image,
    f.explanation_image,
    f.deleted_at,
    f.raw_question,
    f.raw_explanation,
    f.code,
    f.question_html,
    f.explanation_html,
    f.is_archived,
    b.id AS book_id,
    b.title AS book_title,
    bcc.id AS chapter_id,
    bcc."order" AS chapter_order,
    bs.part,
    bs.id AS subchapter_id,
    bs."order" AS subchapter_order,
    bs.title AS subchapter_title,
    bc.id AS content_id,
    bc."order" AS content_order
   FROM (((((public.flashcards f
     LEFT JOIN public.book_content_flashcards bcf ON ((bcf.flashcard_id = f.id)))
     LEFT JOIN public.book_contents bc ON ((bcf.content_id = bc.id)))
     LEFT JOIN public.book_subchapters bs ON ((bc.subchapter_id = bs.id)))
     LEFT JOIN public.book_chapters bcc ON ((bs.chapter_id = bcc.id)))
     LEFT JOIN public.books b ON ((bcc.book_id = b.id)))
  WHERE (f.deleted_at IS NULL);


ALTER TABLE public.flashcards_list_view OWNER TO examkrackers_api;

--
-- Name: glossary; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.glossary (
    id uuid NOT NULL,
    phrase_raw character varying(255) NOT NULL,
    explanation_raw text NOT NULL,
    phrase_delta_object text DEFAULT ''::text NOT NULL,
    explanation_delta_object text DEFAULT ''::text NOT NULL,
    phrase_html text,
    explanation_html text
);


ALTER TABLE public.glossary OWNER TO examkrackers_api;

--
-- Name: group_tutoring_days; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.group_tutoring_days (
    id uuid NOT NULL,
    class_time character varying(255) NOT NULL,
    class_time_end character varying(255) NOT NULL,
    course_id uuid NOT NULL,
    class_date date,
    class_topic character varying(255),
    class_topic_number character varying(255),
    meeting_url character varying(255)
);


ALTER TABLE public.group_tutoring_days OWNER TO examkrackers_api;

--
-- Name: hangman_answered_phrases; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.hangman_answered_phrases (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    category character varying(255) NOT NULL,
    answered_phrases_orders text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.hangman_answered_phrases OWNER TO examkrackers_api;

--
-- Name: hangman_games; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.hangman_games (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    amount_correct integer NOT NULL,
    amount_incorrect integer NOT NULL,
    score integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hangman_games OWNER TO examkrackers_api;

--
-- Name: hangman_hints; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.hangman_hints (
    id uuid NOT NULL,
    hint_raw character varying(255) NOT NULL,
    hint_delta_object text NOT NULL,
    hint_html text NOT NULL,
    "order" integer NOT NULL,
    phrase_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hangman_hints OWNER TO examkrackers_api;

--
-- Name: order_sequence; Type: SEQUENCE; Schema: public; Owner: examkrackers_api
--

CREATE SEQUENCE public.order_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_sequence OWNER TO examkrackers_api;

--
-- Name: hangman_phrases; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.hangman_phrases (
    id uuid NOT NULL,
    phrase_raw character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    image_hint character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    "order" integer DEFAULT nextval('public.order_sequence'::regclass),
    phrase_delta_object text,
    phrase_html text
);


ALTER TABLE public.hangman_phrases OWNER TO examkrackers_api;

--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: examkrackers_api
--

-- CREATE TABLE public.knex_migrations (
--     id integer NOT NULL,
--     name character varying(255),
--     batch integer,
--     migration_time timestamp with time zone
-- );


-- ALTER TABLE public.knex_migrations OWNER TO examkrackers_api;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: examkrackers_api
--

-- CREATE SEQUENCE public.knex_migrations_id_seq
--     AS integer
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1;


-- ALTER TABLE public.knex_migrations_id_seq OWNER TO examkrackers_api;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: examkrackers_api
--

-- ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: examkrackers_api
--

-- CREATE TABLE public.knex_migrations_lock (
--     index integer NOT NULL,
--     is_locked integer
-- );


-- ALTER TABLE public.knex_migrations_lock OWNER TO examkrackers_api;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: examkrackers_api
--

-- CREATE SEQUENCE public.knex_migrations_lock_index_seq
--     AS integer
--     START WITH 1
--     INCREMENT BY 1
--     NO MINVALUE
--     NO MAXVALUE
--     CACHE 1;


-- ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO examkrackers_api;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: examkrackers_api
--

-- ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: layouts; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.layouts (
    id uuid NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.layouts OWNER TO examkrackers_api;

--
-- Name: mcat_dates; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.mcat_dates (
    id uuid NOT NULL,
    course_id uuid,
    mcat_date date NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.mcat_dates OWNER TO examkrackers_api;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    scheduled_for timestamp with time zone,
    deleted_at timestamp with time zone,
    recurring_definition text,
    title text NOT NULL,
    description_raw text NOT NULL,
    description_delta_object text NOT NULL,
    description_html text NOT NULL,
    student_groups text NOT NULL,
    is_paused boolean
);


ALTER TABLE public.notifications OWNER TO examkrackers_api;

--
-- Name: onboarding_categories; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.onboarding_categories (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    "order" integer NOT NULL,
    description text,
    image_url text
);


ALTER TABLE public.onboarding_categories OWNER TO examkrackers_api;

--
-- Name: onboarding_images; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.onboarding_images (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    image_url text NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.onboarding_images OWNER TO examkrackers_api;

--
-- Name: organization_admins; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.organization_admins (
    id uuid NOT NULL,
    organization_id uuid,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    admin_role character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    password_reset_token character varying(255),
    password_reset_token_created_at timestamp with time zone,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL
);


ALTER TABLE public.organization_admins OWNER TO examkrackers_api;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    title character varying(255),
    title_slug character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organizations OWNER TO examkrackers_api;

--
-- Name: percentile_rank; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.percentile_rank (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    section_order integer NOT NULL,
    correct_answer_amount integer NOT NULL,
    percentile_rank numeric(8,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.percentile_rank OWNER TO examkrackers_api;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.questions (
    id uuid NOT NULL,
    answer_definition text NOT NULL,
    type text NOT NULL,
    correct_answers text NOT NULL,
    question_content_raw text NOT NULL,
    question_content_delta_object text NOT NULL,
    explanation_raw text NOT NULL,
    explanation_delta_object text NOT NULL,
    deleted_at timestamp with time zone,
    correct_answers_amount integer DEFAULT 0,
    all_answers_amount integer DEFAULT 0,
    difficulty_percentage real DEFAULT '0'::real,
    is_archived boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.questions OWNER TO examkrackers_api;

--
-- Name: respiration_games; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.respiration_games (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    score integer NOT NULL,
    correct_amount integer NOT NULL,
    incorrect_amount integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    answers text NOT NULL,
    blox_game_enabled boolean NOT NULL,
    difficulty character varying(255),
    is_a_win boolean DEFAULT false NOT NULL,
    is_paused boolean DEFAULT false NOT NULL
);


ALTER TABLE public.respiration_games OWNER TO examkrackers_api;

--
-- Name: s3_files; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.s3_files (
    id uuid NOT NULL,
    key character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.s3_files OWNER TO examkrackers_api;

--
-- Name: salty_bucks_daily_log; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.salty_bucks_daily_log (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    created_at date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    balance integer,
    balance_diff_1 integer,
    balance_diff_7 integer,
    balance_diff_30 integer
);


ALTER TABLE public.salty_bucks_daily_log OWNER TO examkrackers_api;

--
-- Name: salty_bucks_logs; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.salty_bucks_logs (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    amount integer NOT NULL,
    operation_type text NOT NULL,
    operation_subtype text,
    metadata text DEFAULT '{}'::text,
    source text NOT NULL,
    reference_id uuid NOT NULL,
    reference_type text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.salty_bucks_logs OWNER TO examkrackers_api;

--
-- Name: scaled_score_templates; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.scaled_score_templates (
    id uuid NOT NULL,
    title character varying(255)
);


ALTER TABLE public.scaled_score_templates OWNER TO examkrackers_api;

--
-- Name: scaled_scores; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.scaled_scores (
    id uuid NOT NULL,
    template_id uuid,
    correct_answer_amount integer NOT NULL,
    scaled_score integer NOT NULL,
    percentile_rank character varying(255) NOT NULL
);


ALTER TABLE public.scaled_scores OWNER TO examkrackers_api;

--
-- Name: stopwatches; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.stopwatches (
    student_id uuid NOT NULL,
    date date NOT NULL,
    state text NOT NULL,
    seconds integer NOT NULL,
    student_course_id uuid NOT NULL
);


ALTER TABLE public.stopwatches OWNER TO examkrackers_api;

--
-- Name: student_attached_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_attached_exams (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    original_attached_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    type character varying(255) NOT NULL
);


ALTER TABLE public.student_attached_exams OWNER TO examkrackers_api;

--
-- Name: student_book_activity_timers; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_activity_timers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    seconds integer NOT NULL
);


ALTER TABLE public.student_book_activity_timers OWNER TO examkrackers_api;

--
-- Name: student_book_chapter_activity_timers; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_chapter_activity_timers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    student_book_chapter_id uuid NOT NULL,
    seconds integer NOT NULL,
    activity_date date
);


ALTER TABLE public.student_book_chapter_activity_timers OWNER TO examkrackers_api;

--
-- Name: student_book_chapter_images; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_chapter_images (
    id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    original_chapter_id uuid NOT NULL,
    image character varying(255),
    small_ver character varying(255),
    "order" integer NOT NULL
);


ALTER TABLE public.student_book_chapter_images OWNER TO examkrackers_api;

--
-- Name: student_book_chapters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_chapters (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    book_id uuid NOT NULL,
    original_chapter_id uuid NOT NULL,
    "order" integer NOT NULL,
    image_tab_title character varying(255),
    bookmark_id uuid,
    chat_context_id uuid
);


ALTER TABLE public.student_book_chapters OWNER TO examkrackers_api;

--
-- Name: student_book_content_attachments; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_attachments (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    original_attachment_id uuid NOT NULL,
    raw text NOT NULL,
    delta_object text NOT NULL,
    "order" integer NOT NULL,
    type character varying(255)
);


ALTER TABLE public.student_book_content_attachments OWNER TO examkrackers_api;

--
-- Name: student_book_content_comments; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_comments (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    original_book_content_id uuid NOT NULL,
    comment_html text,
    is_read boolean DEFAULT false
);


ALTER TABLE public.student_book_content_comments OWNER TO examkrackers_api;

--
-- Name: student_book_content_course_topics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_course_topics (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    student_book_content_id uuid NOT NULL,
    student_course_topic_id uuid NOT NULL,
    is_read boolean DEFAULT false,
    is_seen boolean DEFAULT false,
    is_artificial boolean DEFAULT false,
    comment_html text
);


ALTER TABLE public.student_book_content_course_topics OWNER TO examkrackers_api;

--
-- Name: student_book_content_flashcards; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_flashcards (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    original_flashcard_id uuid NOT NULL,
    question text,
    explanation text,
    question_image character varying(255),
    explanation_image character varying(255),
    proficiency_level integer DEFAULT 1,
    study_order integer DEFAULT 1,
    question_html text,
    explanation_html text
);


ALTER TABLE public.student_book_content_flashcards OWNER TO examkrackers_api;

--
-- Name: student_book_content_images; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_images (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    original_image_id uuid NOT NULL,
    image character varying(255),
    small_ver character varying(255),
    "order" integer NOT NULL
);


ALTER TABLE public.student_book_content_images OWNER TO examkrackers_api;

--
-- Name: student_book_content_pins; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_pins (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    variant character varying(255) NOT NULL,
    note character varying(255) NOT NULL
);


ALTER TABLE public.student_book_content_pins OWNER TO examkrackers_api;

--
-- Name: student_book_content_questions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_questions (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    original_content_question_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    "order" integer NOT NULL,
    question text NOT NULL,
    answer_definition text NOT NULL,
    correct_answers character varying(255) NOT NULL,
    explanation text NOT NULL,
    answers text,
    is_correct boolean,
    answered_at timestamp with time zone
);


ALTER TABLE public.student_book_content_questions OWNER TO examkrackers_api;

--
-- Name: student_book_content_resources; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_content_resources (
    id uuid NOT NULL,
    content_id uuid NOT NULL,
    original_resource_id uuid NOT NULL,
    raw text,
    delta_object text,
    external_id uuid,
    "order" integer NOT NULL,
    type character varying(255) NOT NULL,
    is_read boolean DEFAULT false
);


ALTER TABLE public.student_book_content_resources OWNER TO examkrackers_api;

--
-- Name: student_book_contents; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_contents (
    id uuid NOT NULL,
    raw text NOT NULL,
    delta_object text NOT NULL,
    type character varying(255) NOT NULL,
    content_status character varying(255) NOT NULL,
    subchapter_id uuid NOT NULL,
    original_content_id uuid NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE public.student_book_contents OWNER TO examkrackers_api;

--
-- Name: student_book_contents_read; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_contents_read (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    updated_at date NOT NULL,
    content_read_amount integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.student_book_contents_read OWNER TO examkrackers_api;

--
-- Name: student_book_subchapter_notes; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_subchapter_notes (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    subchapter_id uuid NOT NULL,
    raw text NOT NULL,
    delta_object text NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.student_book_subchapter_notes OWNER TO examkrackers_api;

--
-- Name: student_book_subchapters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_subchapters (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    chapter_id uuid NOT NULL,
    original_subchapter_id uuid NOT NULL,
    "order" integer NOT NULL,
    part integer NOT NULL
);


ALTER TABLE public.student_book_subchapters OWNER TO examkrackers_api;

--
-- Name: student_book_videos; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_book_videos (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    video_id uuid NOT NULL,
    student_subchapter_id uuid NOT NULL,
    is_in_free_trial boolean
);


ALTER TABLE public.student_book_videos OWNER TO examkrackers_api;

--
-- Name: student_books; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_books (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    student_id uuid NOT NULL,
    book_id uuid NOT NULL,
    course_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    external_created_at date,
    tag character varying(255),
    tag_colour character varying(255),
    image_url text,
    last_chapter character varying(255),
    last_part character varying(255),
    is_free_trial boolean DEFAULT false,
    chapter_heading_image_url character varying(255),
    preview_state text,
    is_test_bundle boolean DEFAULT false,
    header_abbreviation text
);


ALTER TABLE public.student_books OWNER TO examkrackers_api;

--
-- Name: student_box_flashcards; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_box_flashcards (
    id uuid NOT NULL,
    student_flashcard_box_id uuid NOT NULL,
    student_flashcard_id uuid NOT NULL
);


ALTER TABLE public.student_box_flashcards OWNER TO examkrackers_api;

--
-- Name: student_calendar_days_off; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_calendar_days_off (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    day_off_date date NOT NULL
);


ALTER TABLE public.student_calendar_days_off OWNER TO examkrackers_api;

--
-- Name: student_calendar_events; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_calendar_events (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    event_date date NOT NULL,
    duration integer NOT NULL,
    "order" integer NOT NULL,
    action_uri text,
    is_manual boolean DEFAULT false,
    event_colour character varying(255),
    description text,
    student_item_id uuid,
    student_exam_id uuid,
    student_exam_ids text,
    from_manual_setup boolean DEFAULT false,
    class_time character varying(255),
    class_time_end character varying(255),
    is_locked_in_free_trial boolean DEFAULT false
);


ALTER TABLE public.student_calendar_events OWNER TO examkrackers_api;

--
-- Name: student_completion_meters; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_completion_meters (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    oil_level integer DEFAULT 0 NOT NULL,
    oil_calculated_at date,
    temperature integer DEFAULT 0,
    avg_velocity_1_day_before integer DEFAULT 0,
    avg_velocity_2_days_before integer DEFAULT 0,
    avg_velocity_3_days_before integer DEFAULT 0,
    was_in_the_green_1_day_before boolean DEFAULT false,
    was_in_the_green_2_days_before boolean DEFAULT false,
    was_in_the_green_3_days_before boolean DEFAULT false
);


ALTER TABLE public.student_completion_meters OWNER TO examkrackers_api;

--
-- Name: student_course_activity_timers; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_course_activity_timers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    seconds integer NOT NULL
);


ALTER TABLE public.student_course_activity_timers OWNER TO examkrackers_api;

--
-- Name: student_course_end_date_days; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_course_end_date_days (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    course_end_date_days_id uuid NOT NULL
);


ALTER TABLE public.student_course_end_date_days OWNER TO examkrackers_api;

--
-- Name: student_course_topics; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_course_topics (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    topic character varying(255) NOT NULL,
    "order" integer,
    level integer,
    is_mastered boolean DEFAULT false,
    original_course_topic_id uuid
);


ALTER TABLE public.student_course_topics OWNER TO examkrackers_api;

--
-- Name: student_courses; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_courses (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    book_course_id uuid NOT NULL,
    external_created_at timestamp with time zone NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    accessible_from timestamp with time zone,
    accessible_to timestamp with time zone,
    is_ready boolean,
    status character varying(255) NOT NULL,
    completed_at timestamp with time zone,
    metadata text,
    subtitle text,
    expected_end_date timestamp with time zone,
    is_paused boolean DEFAULT false,
    flashcard_count bigint DEFAULT '0'::bigint NOT NULL,
    flashcard_snapshot text,
    book_order text,
    course_topics_title character varying(255),
    original_end_date timestamp with time zone,
    original_metadata text,
    transaction_id character varying(255),
    end_date_id uuid,
    is_already_copied boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    calendar_start_at date DEFAULT CURRENT_TIMESTAMP,
    exam_at date,
    days_off_ignored boolean DEFAULT false,
    prioridays json,
    mcat_date_id uuid,
    videos_migrated boolean DEFAULT false,
    current_study_streak integer DEFAULT 0 NOT NULL,
    longest_study_streak integer DEFAULT 0 NOT NULL,
    site_activity json DEFAULT '{}'::json,
    is_pre_reading boolean DEFAULT false
);


ALTER TABLE public.student_courses OWNER TO examkrackers_api;

--
-- Name: student_exam_logs; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exam_logs (
    id uuid NOT NULL,
    exam_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(255),
    content text
);


ALTER TABLE public.student_exam_logs OWNER TO examkrackers_api;

--
-- Name: student_exam_passages; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exam_passages (
    id uuid NOT NULL,
    student_section_id uuid,
    content text NOT NULL,
    "order" integer NOT NULL,
    original_exam_passage_id uuid,
    is_false_passage boolean DEFAULT false,
    checking integer,
    reading integer,
    working integer,
    reading_speed integer
);


ALTER TABLE public.student_exam_passages OWNER TO examkrackers_api;

--
-- Name: student_exam_questions; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exam_questions (
    id uuid NOT NULL,
    student_passage_id uuid,
    question_content text NOT NULL,
    answer_definition text NOT NULL,
    explanation text NOT NULL,
    chapter text,
    question_type character varying(255) NOT NULL,
    correct_answer character varying(255) NOT NULL,
    "order" integer NOT NULL,
    is_flagged boolean DEFAULT false,
    question_status character varying(255) DEFAULT 'unseen'::character varying,
    answer character varying(255),
    original_exam_question_id uuid,
    canvas text,
    background_image character varying(255),
    checking integer,
    reading integer,
    working integer
);


ALTER TABLE public.student_exam_questions OWNER TO examkrackers_api;

--
-- Name: student_exam_scores; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exam_scores (
    id uuid NOT NULL,
    exam_type_id uuid NOT NULL,
    scores text NOT NULL,
    student_id uuid NOT NULL,
    is_ts_attached_to_pts boolean DEFAULT true
);


ALTER TABLE public.student_exam_scores OWNER TO examkrackers_api;

--
-- Name: student_exam_sections; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exam_sections (
    id uuid NOT NULL,
    student_exam_id uuid,
    title character varying(255) NOT NULL,
    "order" integer NOT NULL,
    section_status character varying(255) DEFAULT 'phase_1'::character varying,
    is_intact boolean DEFAULT true,
    is_finished boolean DEFAULT false,
    full_title character varying(255)
);


ALTER TABLE public.student_exam_sections OWNER TO examkrackers_api;

--
-- Name: student_exams; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_exams (
    id uuid NOT NULL,
    layout_id uuid NOT NULL,
    student_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    external_id character varying(255),
    title character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    accessible_from timestamp with time zone,
    accessible_to timestamp with time zone,
    is_active boolean DEFAULT true,
    exam_length text,
    access_period integer,
    status character varying(255) DEFAULT 'scheduled'::character varying NOT NULL,
    exam_seconds_left text,
    current_page character varying(255),
    is_intact boolean DEFAULT true,
    completed_at timestamp with time zone,
    timers text,
    time_option character varying(255) DEFAULT '1.0'::character varying,
    break_definition text,
    completed_as integer,
    scores text,
    is_excluded_from_pts boolean DEFAULT false,
    timer_checkboxes text,
    exam_type_id uuid,
    external_created_at date DEFAULT '2023-08-09'::date,
    deleted_at timestamp with time zone,
    scores_status character varying(255),
    revision timestamp with time zone,
    is_free_trial boolean DEFAULT false,
    periodic_table_enabled boolean DEFAULT true
);


ALTER TABLE public.student_exams OWNER TO examkrackers_api;

--
-- Name: student_favourite_videos; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_favourite_videos (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    resource_id uuid,
    video_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    course_id uuid NOT NULL
);


ALTER TABLE public.student_favourite_videos OWNER TO examkrackers_api;

--
-- Name: student_flashcard_archive; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_flashcard_archive (
    id uuid NOT NULL,
    student_flashcard_id uuid NOT NULL,
    student_course_id uuid NOT NULL
);


ALTER TABLE public.student_flashcard_archive OWNER TO examkrackers_api;

--
-- Name: student_flashcard_boxes; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_flashcard_boxes (
    id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.student_flashcard_boxes OWNER TO examkrackers_api;

--
-- Name: students; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.students (
    id uuid NOT NULL,
    name character varying(255),
    email character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    phone_number character varying(255),
    has_books boolean DEFAULT false,
    has_exams boolean DEFAULT false,
    salty_bucks_balance integer DEFAULT 0 NOT NULL,
    deleted_at timestamp with time zone,
    activity_streak_2min timestamp with time zone,
    activity_streak_30min timestamp with time zone,
    flashcard_study_mode character varying(255) DEFAULT 'front'::character varying,
    has_courses boolean DEFAULT false,
    username character varying(255),
    is_student boolean DEFAULT true NOT NULL,
    verification_code character varying(255),
    code_created_at timestamp with time zone,
    code_expires_at timestamp with time zone,
    external_id bigint,
    support_tab_seen boolean DEFAULT false NOT NULL,
    timezone character varying(255),
    use_default_timezone boolean DEFAULT true,
    video_bg_music_enabled boolean DEFAULT true,
    cq_animations_enabled boolean DEFAULT true,
    theme character varying(255) DEFAULT 'light'::character varying,
    is_onboarding_seen boolean DEFAULT false,
    login_count integer DEFAULT 0,
    wallet_balance integer DEFAULT 0,
    logged_at timestamp with time zone,
    CONSTRAINT positive_salty_bucks_balance CHECK ((salty_bucks_balance >= 0))
);


ALTER TABLE public.students OWNER TO examkrackers_api;

--
-- Name: student_flashcard_study_list_view; Type: VIEW; Schema: public; Owner: examkrackers_api
--

CREATE VIEW public.student_flashcard_study_list_view AS
 SELECT DISTINCT ON (f.original_flashcard_id, b.student_id) f.id AS student_flashcard_id,
    f.original_flashcard_id AS id,
    f.question,
    f.explanation,
    f.question_image,
    f.explanation_image,
    f.proficiency_level,
    f.question_html,
    f.explanation_html,
    b.student_id,
    s.flashcard_study_mode AS study_mode,
    fl.code,
    f.study_order,
    fl.is_archived
   FROM ((((((public.student_book_content_flashcards f
     LEFT JOIN public.student_book_contents bc ON ((f.content_id = bc.id)))
     LEFT JOIN public.student_book_subchapters bs ON ((bc.subchapter_id = bs.id)))
     LEFT JOIN public.student_book_chapters bcc ON ((bs.chapter_id = bcc.id)))
     LEFT JOIN public.student_books b ON ((bcc.book_id = b.id)))
     LEFT JOIN public.students s ON ((b.student_id = s.id)))
     LEFT JOIN public.flashcards fl ON ((f.original_flashcard_id = fl.id)));


ALTER TABLE public.student_flashcard_study_list_view OWNER TO examkrackers_api;

--
-- Name: student_notifications; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_notifications (
    id uuid NOT NULL,
    author_id uuid NOT NULL,
    notification_id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid,
    created_at timestamp with time zone NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_flagged boolean DEFAULT false,
    is_seen boolean DEFAULT false
);


ALTER TABLE public.student_notifications OWNER TO examkrackers_api;

--
-- Name: student_pin_variants; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_pin_variants (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    variant character varying(255) NOT NULL,
    title character varying(255)
);


ALTER TABLE public.student_pin_variants OWNER TO examkrackers_api;

--
-- Name: student_tokens; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_tokens (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.student_tokens OWNER TO examkrackers_api;

--
-- Name: student_video_ratings; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_video_ratings (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    video_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    rating integer NOT NULL
);


ALTER TABLE public.student_video_ratings OWNER TO examkrackers_api;

--
-- Name: student_videos; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.student_videos (
    id uuid NOT NULL,
    student_id uuid,
    video_id uuid,
    delta_object text,
    is_read boolean
);


ALTER TABLE public.student_videos OWNER TO examkrackers_api;

--
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.user_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255),
    expires_at timestamp with time zone
);


ALTER TABLE public.user_tokens OWNER TO examkrackers_api;

--
-- Name: users; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255),
    password character varying(255),
    email_verification_token character varying(255),
    is_email_verified boolean DEFAULT false,
    is_active boolean DEFAULT false,
    password_reset_token character varying(255),
    password_reset_token_created_at timestamp with time zone,
    user_role character varying(255) DEFAULT 'normal_user'::character varying
);


ALTER TABLE public.users OWNER TO examkrackers_api;

--
-- Name: video_activity_timers; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.video_activity_timers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_course_id uuid NOT NULL,
    student_book_id uuid NOT NULL,
    video_id uuid NOT NULL,
    seconds integer NOT NULL,
    activity_date date
);


ALTER TABLE public.video_activity_timers OWNER TO examkrackers_api;

--
-- Name: video_categories; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.video_categories (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    course_id uuid NOT NULL,
    course_type character varying(255) NOT NULL,
    end_date_id uuid,
    is_hidden boolean DEFAULT false
);


ALTER TABLE public.video_categories OWNER TO examkrackers_api;

--
-- Name: videos; Type: TABLE; Schema: public; Owner: examkrackers_api
--

CREATE TABLE public.videos (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    source character varying(255) NOT NULL,
    thumbnail character varying(255),
    duration integer,
    deleted_at timestamp with time zone,
    is_archived boolean DEFAULT false,
    rating numeric(8,2),
    fake_rating numeric(8,2),
    use_fake_rating boolean DEFAULT false NOT NULL,
    category character varying(255) DEFAULT NULL::character varying,
    course_end_date_id uuid,
    source_no_bg_music character varying(255),
    course_id uuid
);


ALTER TABLE public.videos OWNER TO examkrackers_api;

--
-- Name: videos_list_view; Type: VIEW; Schema: public; Owner: examkrackers_api
--

CREATE VIEW public.videos_list_view AS
 SELECT DISTINCT ON (v.id) v.id,
    v.title,
    v.description,
    v.source,
    v.thumbnail,
    v.duration,
    v.deleted_at,
    v.is_archived,
    b.id AS book_id,
    b.title AS book_title,
    bcc.id AS chapter_id,
    bcc."order" AS chapter_order,
    bs.part,
    bs.id AS subchapter_id,
    bs."order" AS subchapter_order,
    bs.title AS subchapter_title,
    bc.id AS content_id,
    bc."order" AS content_order,
    bcr.type AS resource_type,
    bcr."order" AS resource_order
   FROM (((((public.videos v
     LEFT JOIN public.book_content_resources bcr ON ((bcr.external_id = v.id)))
     LEFT JOIN public.book_contents bc ON ((bcr.content_id = bc.id)))
     LEFT JOIN public.book_subchapters bs ON ((bc.subchapter_id = bs.id)))
     LEFT JOIN public.book_chapters bcc ON ((bs.chapter_id = bcc.id)))
     LEFT JOIN public.books b ON ((bcc.book_id = b.id)))
  WHERE (v.deleted_at IS NULL);


ALTER TABLE public.videos_list_view OWNER TO examkrackers_api;

--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: examkrackers_api
--

-- ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: examkrackers_api
--

-- ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: flashcards_code_seq; Type: SEQUENCE SET; Schema: public; Owner: examkrackers_api
--

SELECT pg_catalog.setval('public.flashcards_code_seq', 1, false);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: examkrackers_api
--

-- SELECT pg_catalog.setval('public.knex_migrations_id_seq', 709, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: examkrackers_api
--

-- SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: order_sequence; Type: SEQUENCE SET; Schema: public; Owner: examkrackers_api
--

SELECT pg_catalog.setval('public.order_sequence', 1, false);


--
-- Name: admins admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_unique UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: amino_acid_games amino_acid_games_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.amino_acid_games
    ADD CONSTRAINT amino_acid_games_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_namespace_name_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_namespace_name_unique UNIQUE (namespace, name);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: attached_exams attached_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.attached_exams
    ADD CONSTRAINT attached_exams_pkey PRIMARY KEY (id);


--
-- Name: auth_debug auth_debug_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.auth_debug
    ADD CONSTRAINT auth_debug_pkey PRIMARY KEY (id);


--
-- Name: book_admins book_admins_admin_id_book_id_permission_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_admins
    ADD CONSTRAINT book_admins_admin_id_book_id_permission_unique UNIQUE (admin_id, book_id, permission);


--
-- Name: book_admins book_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_admins
    ADD CONSTRAINT book_admins_pkey PRIMARY KEY (id);


--
-- Name: book_chapter_images book_chapter_images_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_chapter_images
    ADD CONSTRAINT book_chapter_images_pkey PRIMARY KEY (id);


--
-- Name: book_chapters book_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_chapters
    ADD CONSTRAINT book_chapters_pkey PRIMARY KEY (id);


--
-- Name: book_content_attachments book_content_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_attachments
    ADD CONSTRAINT book_content_attachments_pkey PRIMARY KEY (id);


--
-- Name: book_content_comments book_content_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_comments
    ADD CONSTRAINT book_content_comments_pkey PRIMARY KEY (id);


--
-- Name: book_content_course_topics book_content_course_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_course_topics
    ADD CONSTRAINT book_content_course_topics_pkey PRIMARY KEY (id);


--
-- Name: book_content_flashcards book_content_flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_flashcards
    ADD CONSTRAINT book_content_flashcards_pkey PRIMARY KEY (content_id, flashcard_id);


--
-- Name: book_content_images book_content_images_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_images
    ADD CONSTRAINT book_content_images_pkey PRIMARY KEY (id);


--
-- Name: book_content_questions book_content_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_questions
    ADD CONSTRAINT book_content_questions_pkey PRIMARY KEY (id);


--
-- Name: book_content_resources book_content_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_resources
    ADD CONSTRAINT book_content_resources_pkey PRIMARY KEY (id);


--
-- Name: book_contents book_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_contents
    ADD CONSTRAINT book_contents_pkey PRIMARY KEY (id);


--
-- Name: courses book_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT book_courses_pkey PRIMARY KEY (id);


--
-- Name: courses book_courses_title_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT book_courses_title_unique UNIQUE (title);


--
-- Name: book_erratas book_erratas_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_erratas
    ADD CONSTRAINT book_erratas_pkey PRIMARY KEY (id);


--
-- Name: book_subchapters book_subchapters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_subchapters
    ADD CONSTRAINT book_subchapters_pkey PRIMARY KEY (id);


--
-- Name: books books_external_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_external_id_unique UNIQUE (external_id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: books books_title_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_title_unique UNIQUE (title);


--
-- Name: calendar_chapter_exams calendar_chapter_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapter_exams
    ADD CONSTRAINT calendar_chapter_exams_pkey PRIMARY KEY (id);


--
-- Name: calendar_chapters calendar_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapters
    ADD CONSTRAINT calendar_chapters_pkey PRIMARY KEY (id);


--
-- Name: calendar_full_exams calendar_full_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_full_exams
    ADD CONSTRAINT calendar_full_exams_pkey PRIMARY KEY (id);


--
-- Name: calendar_section_exams calendar_section_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_section_exams
    ADD CONSTRAINT calendar_section_exams_pkey PRIMARY KEY (id);


--
-- Name: calendar_settings calendar_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_settings
    ADD CONSTRAINT calendar_settings_pkey PRIMARY KEY (id);


--
-- Name: chapter_admins chapter_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chapter_admins
    ADD CONSTRAINT chapter_admins_pkey PRIMARY KEY (admin_id, chapter_id);


--
-- Name: chat_chapter_scores chat_chapter_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_chapter_scores
    ADD CONSTRAINT chat_chapter_scores_pkey PRIMARY KEY (id);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (id);


--
-- Name: content_question_reactions content_question_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.content_question_reactions
    ADD CONSTRAINT content_question_reactions_pkey PRIMARY KEY (id);


--
-- Name: course_books course_books_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_pkey PRIMARY KEY (course_id, book_id);


--
-- Name: course_end_date_days course_end_date_days_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_date_days
    ADD CONSTRAINT course_end_date_days_pkey PRIMARY KEY (id);


--
-- Name: course_end_dates course_end_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_dates
    ADD CONSTRAINT course_end_dates_pkey PRIMARY KEY (id);


--
-- Name: course_extensions course_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_extensions
    ADD CONSTRAINT course_extensions_pkey PRIMARY KEY (id);


--
-- Name: course_map course_map_external_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_map
    ADD CONSTRAINT course_map_external_id_unique UNIQUE (external_id);


--
-- Name: course_map course_map_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_map
    ADD CONSTRAINT course_map_pkey PRIMARY KEY (id);


--
-- Name: course_topics course_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_topics
    ADD CONSTRAINT course_topics_pkey PRIMARY KEY (id);


--
-- Name: custom_event_groups custom_event_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.custom_event_groups
    ADD CONSTRAINT custom_event_groups_pkey PRIMARY KEY (id);


--
-- Name: custom_event_types custom_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.custom_event_types
    ADD CONSTRAINT custom_event_types_pkey PRIMARY KEY (id);


--
-- Name: exam_erratas exam_erratas_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_erratas
    ADD CONSTRAINT exam_erratas_pkey PRIMARY KEY (id);


--
-- Name: exam_intro_pages exam_intro_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_intro_pages
    ADD CONSTRAINT exam_intro_pages_pkey PRIMARY KEY (id);


--
-- Name: exam_logs exam_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_logs
    ADD CONSTRAINT exam_logs_pkey PRIMARY KEY (id);


--
-- Name: exam_metrics_avg exam_metrics_avg_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_metrics_avg
    ADD CONSTRAINT exam_metrics_avg_pkey PRIMARY KEY (id);


--
-- Name: exam_metrics exam_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_metrics
    ADD CONSTRAINT exam_metrics_pkey PRIMARY KEY (id);


--
-- Name: exam_passage_metrics_avg exam_passage_metrics_avg_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passage_metrics_avg
    ADD CONSTRAINT exam_passage_metrics_avg_pkey PRIMARY KEY (id);


--
-- Name: exam_passage_metrics exam_passage_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passage_metrics
    ADD CONSTRAINT exam_passage_metrics_pkey PRIMARY KEY (id);


--
-- Name: exam_passage_time_metrics exam_passage_time_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passage_time_metrics
    ADD CONSTRAINT exam_passage_time_metrics_pkey PRIMARY KEY (id);


--
-- Name: exam_passages exam_passages_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passages
    ADD CONSTRAINT exam_passages_pkey PRIMARY KEY (id);


--
-- Name: exam_question_time_metrics exam_question_time_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_question_time_metrics
    ADD CONSTRAINT exam_question_time_metrics_pkey PRIMARY KEY (id);


--
-- Name: exam_questions exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_pkey PRIMARY KEY (id);


--
-- Name: exam_score_map exam_score_map_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_score_map
    ADD CONSTRAINT exam_score_map_pkey PRIMARY KEY (id);


--
-- Name: exam_score_stats exam_score_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_score_stats
    ADD CONSTRAINT exam_score_stats_pkey PRIMARY KEY (id);


--
-- Name: exam_scores exam_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_scores
    ADD CONSTRAINT exam_scores_pkey PRIMARY KEY (id);


--
-- Name: exam_section_score_map exam_section_score_map_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_section_score_map
    ADD CONSTRAINT exam_section_score_map_pkey PRIMARY KEY (id);


--
-- Name: exam_section_scores exam_section_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_section_scores
    ADD CONSTRAINT exam_section_scores_pkey PRIMARY KEY (id);


--
-- Name: exam_sections exam_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_sections
    ADD CONSTRAINT exam_sections_pkey PRIMARY KEY (id);


--
-- Name: exam_type_scaled_score_templates exam_type_scaled_score_templates_exam_type_id_template_id_order; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_type_scaled_score_templates
    ADD CONSTRAINT exam_type_scaled_score_templates_exam_type_id_template_id_order UNIQUE (exam_type_id, template_id, "order");


--
-- Name: exam_type_scaled_score_templates exam_type_scaled_score_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_type_scaled_score_templates
    ADD CONSTRAINT exam_type_scaled_score_templates_pkey PRIMARY KEY (id);


--
-- Name: exam_types exam_types_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_types
    ADD CONSTRAINT exam_types_pkey PRIMARY KEY (id);


--
-- Name: exams exams_external_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_external_id_unique UNIQUE (external_id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: favourite_videos favourite_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.favourite_videos
    ADD CONSTRAINT favourite_videos_pkey PRIMARY KEY (id);


--
-- Name: flashcard_activity_timers flashcard_activity_timers_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcard_activity_timers
    ADD CONSTRAINT flashcard_activity_timers_pkey PRIMARY KEY (id);


--
-- Name: flashcards flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_pkey PRIMARY KEY (id);


--
-- Name: glossary glossary_phrase_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.glossary
    ADD CONSTRAINT glossary_phrase_unique UNIQUE (phrase_raw);


--
-- Name: glossary glossary_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.glossary
    ADD CONSTRAINT glossary_pkey PRIMARY KEY (id);


--
-- Name: group_tutoring_days group_tutoring_days_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.group_tutoring_days
    ADD CONSTRAINT group_tutoring_days_pkey PRIMARY KEY (id);


--
-- Name: hangman_answered_phrases hangman_answered_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_answered_phrases
    ADD CONSTRAINT hangman_answered_phrases_pkey PRIMARY KEY (id);


--
-- Name: hangman_answered_phrases hangman_answered_phrases_student_id_category_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_answered_phrases
    ADD CONSTRAINT hangman_answered_phrases_student_id_category_unique UNIQUE (student_id, category);


--
-- Name: hangman_games hangman_games_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_games
    ADD CONSTRAINT hangman_games_pkey PRIMARY KEY (id);


--
-- Name: hangman_hints hangman_hints_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_hints
    ADD CONSTRAINT hangman_hints_pkey PRIMARY KEY (id);


--
-- Name: hangman_phrases hangman_phrases_order_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_phrases
    ADD CONSTRAINT hangman_phrases_order_unique UNIQUE ("order");


--
-- Name: hangman_phrases hangman_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_phrases
    ADD CONSTRAINT hangman_phrases_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

-- ALTER TABLE ONLY public.knex_migrations_lock
--     ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

-- ALTER TABLE ONLY public.knex_migrations
--     ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: layouts layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.layouts
    ADD CONSTRAINT layouts_pkey PRIMARY KEY (id);


--
-- Name: mcat_dates mcat_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.mcat_dates
    ADD CONSTRAINT mcat_dates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_categories onboarding_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.onboarding_categories
    ADD CONSTRAINT onboarding_categories_pkey PRIMARY KEY (id);


--
-- Name: onboarding_images onboarding_images_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.onboarding_images
    ADD CONSTRAINT onboarding_images_pkey PRIMARY KEY (id);


--
-- Name: organization_admins organization_admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.organization_admins
    ADD CONSTRAINT organization_admins_email_unique UNIQUE (email);


--
-- Name: organization_admins organization_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.organization_admins
    ADD CONSTRAINT organization_admins_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_title_slug_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_title_slug_unique UNIQUE (title_slug);


--
-- Name: percentile_rank percentile_rank_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.percentile_rank
    ADD CONSTRAINT percentile_rank_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: respiration_games respiration_games_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.respiration_games
    ADD CONSTRAINT respiration_games_pkey PRIMARY KEY (id);


--
-- Name: s3_files s3_files_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.s3_files
    ADD CONSTRAINT s3_files_pkey PRIMARY KEY (id);


--
-- Name: salty_bucks_daily_log salty_bucks_daily_log_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.salty_bucks_daily_log
    ADD CONSTRAINT salty_bucks_daily_log_pkey PRIMARY KEY (id);


--
-- Name: salty_bucks_daily_log salty_bucks_daily_log_student_id_created_at_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.salty_bucks_daily_log
    ADD CONSTRAINT salty_bucks_daily_log_student_id_created_at_unique UNIQUE (student_id, created_at);


--
-- Name: salty_bucks_logs salty_bucks_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.salty_bucks_logs
    ADD CONSTRAINT salty_bucks_logs_pkey PRIMARY KEY (id);


--
-- Name: scaled_score_templates scaled_score_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.scaled_score_templates
    ADD CONSTRAINT scaled_score_templates_pkey PRIMARY KEY (id);


--
-- Name: scaled_score_templates scaled_score_templates_title_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.scaled_score_templates
    ADD CONSTRAINT scaled_score_templates_title_unique UNIQUE (title);


--
-- Name: scaled_scores scaled_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.scaled_scores
    ADD CONSTRAINT scaled_scores_pkey PRIMARY KEY (id);


--
-- Name: stopwatches stopwatches_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.stopwatches
    ADD CONSTRAINT stopwatches_pkey PRIMARY KEY (student_course_id, student_id, date);


--
-- Name: student_attached_exams student_attached_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_attached_exams
    ADD CONSTRAINT student_attached_exams_pkey PRIMARY KEY (id);


--
-- Name: student_book_activity_timers student_book_activity_timers_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_activity_timers
    ADD CONSTRAINT student_book_activity_timers_pkey PRIMARY KEY (id);


--
-- Name: student_book_chapter_activity_timers student_book_chapter_activity_timers_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_activity_timers
    ADD CONSTRAINT student_book_chapter_activity_timers_pkey PRIMARY KEY (id);


--
-- Name: student_book_chapter_images student_book_chapter_images_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_images
    ADD CONSTRAINT student_book_chapter_images_pkey PRIMARY KEY (id);


--
-- Name: student_book_chapters student_book_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapters
    ADD CONSTRAINT student_book_chapters_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_attachments student_book_content_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_attachments
    ADD CONSTRAINT student_book_content_attachments_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_comments student_book_content_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_comments
    ADD CONSTRAINT student_book_content_comments_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_course_topics student_book_content_course_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_course_topics
    ADD CONSTRAINT student_book_content_course_topics_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_flashcards student_book_content_flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_flashcards
    ADD CONSTRAINT student_book_content_flashcards_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_images student_book_content_images_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_images
    ADD CONSTRAINT student_book_content_images_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_pins student_book_content_pins_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_pins
    ADD CONSTRAINT student_book_content_pins_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_questions student_book_content_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_questions
    ADD CONSTRAINT student_book_content_questions_pkey PRIMARY KEY (id);


--
-- Name: student_book_content_resources student_book_content_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_resources
    ADD CONSTRAINT student_book_content_resources_pkey PRIMARY KEY (id);


--
-- Name: student_book_contents student_book_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents
    ADD CONSTRAINT student_book_contents_pkey PRIMARY KEY (id);


--
-- Name: student_book_contents_read student_book_contents_read_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents_read
    ADD CONSTRAINT student_book_contents_read_pkey PRIMARY KEY (id);


--
-- Name: student_book_contents_read student_book_contents_read_student_course_id_student_book_id_up; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents_read
    ADD CONSTRAINT student_book_contents_read_student_course_id_student_book_id_up UNIQUE (student_course_id, student_book_id, updated_at);


--
-- Name: student_book_subchapter_notes student_book_subchapter_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapter_notes
    ADD CONSTRAINT student_book_subchapter_notes_pkey PRIMARY KEY (id);


--
-- Name: student_book_subchapter_notes student_book_subchapter_notes_student_id_subchapter_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapter_notes
    ADD CONSTRAINT student_book_subchapter_notes_student_id_subchapter_id_unique UNIQUE (student_id, subchapter_id);


--
-- Name: student_book_subchapters student_book_subchapters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapters
    ADD CONSTRAINT student_book_subchapters_pkey PRIMARY KEY (id);


--
-- Name: student_book_videos student_book_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_videos
    ADD CONSTRAINT student_book_videos_pkey PRIMARY KEY (id);


--
-- Name: student_books student_books_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_books
    ADD CONSTRAINT student_books_pkey PRIMARY KEY (id);


--
-- Name: student_box_flashcards student_box_flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_box_flashcards
    ADD CONSTRAINT student_box_flashcards_pkey PRIMARY KEY (id);


--
-- Name: student_calendar_days_off student_calendar_days_off_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_calendar_days_off
    ADD CONSTRAINT student_calendar_days_off_pkey PRIMARY KEY (id);


--
-- Name: student_calendar_events student_calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_calendar_events
    ADD CONSTRAINT student_calendar_events_pkey PRIMARY KEY (id);


--
-- Name: student_completion_meters student_completion_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_completion_meters
    ADD CONSTRAINT student_completion_meters_pkey PRIMARY KEY (id);


--
-- Name: student_completion_meters student_completion_meters_student_course_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_completion_meters
    ADD CONSTRAINT student_completion_meters_student_course_id_unique UNIQUE (student_course_id);


--
-- Name: student_course_activity_timers student_course_activity_timers_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_activity_timers
    ADD CONSTRAINT student_course_activity_timers_pkey PRIMARY KEY (id);


--
-- Name: student_course_end_date_days student_course_end_date_days_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_end_date_days
    ADD CONSTRAINT student_course_end_date_days_pkey PRIMARY KEY (id);


--
-- Name: student_course_topics student_course_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_topics
    ADD CONSTRAINT student_course_topics_pkey PRIMARY KEY (id);


--
-- Name: student_courses student_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_pkey PRIMARY KEY (id);


--
-- Name: student_exam_logs student_exam_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_logs
    ADD CONSTRAINT student_exam_logs_pkey PRIMARY KEY (id);


--
-- Name: student_exam_passages student_exam_passages_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_passages
    ADD CONSTRAINT student_exam_passages_pkey PRIMARY KEY (id);


--
-- Name: student_exam_questions student_exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_questions
    ADD CONSTRAINT student_exam_questions_pkey PRIMARY KEY (id);


--
-- Name: student_exam_scores student_exam_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_scores
    ADD CONSTRAINT student_exam_scores_pkey PRIMARY KEY (id);


--
-- Name: student_exam_scores student_exam_scores_student_id_exam_type_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_scores
    ADD CONSTRAINT student_exam_scores_student_id_exam_type_id_unique UNIQUE (student_id, exam_type_id);


--
-- Name: student_exam_sections student_exam_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_sections
    ADD CONSTRAINT student_exam_sections_pkey PRIMARY KEY (id);


--
-- Name: student_exams student_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exams
    ADD CONSTRAINT student_exams_pkey PRIMARY KEY (id);


--
-- Name: student_favourite_videos student_favourite_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_favourite_videos
    ADD CONSTRAINT student_favourite_videos_pkey PRIMARY KEY (id);


--
-- Name: student_flashcard_archive student_flashcard_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_archive
    ADD CONSTRAINT student_flashcard_archive_pkey PRIMARY KEY (id);


--
-- Name: student_flashcard_archive student_flashcard_archive_student_flashcard_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_archive
    ADD CONSTRAINT student_flashcard_archive_student_flashcard_id_unique UNIQUE (student_flashcard_id);


--
-- Name: student_flashcard_boxes student_flashcard_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_boxes
    ADD CONSTRAINT student_flashcard_boxes_pkey PRIMARY KEY (id);


--
-- Name: student_flashcard_boxes student_flashcard_boxes_student_course_id_title_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_boxes
    ADD CONSTRAINT student_flashcard_boxes_student_course_id_title_unique UNIQUE (student_course_id, title);


--
-- Name: student_notifications student_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_notifications
    ADD CONSTRAINT student_notifications_pkey PRIMARY KEY (id);


--
-- Name: student_pin_variants student_pin_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_pin_variants
    ADD CONSTRAINT student_pin_variants_pkey PRIMARY KEY (id);


--
-- Name: student_pin_variants student_pin_variants_student_id_student_book_id_variant_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_pin_variants
    ADD CONSTRAINT student_pin_variants_student_id_student_book_id_variant_unique UNIQUE (student_id, student_book_id, variant);


--
-- Name: student_tokens student_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_tokens
    ADD CONSTRAINT student_tokens_pkey PRIMARY KEY (id);


--
-- Name: student_tokens student_tokens_student_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_tokens
    ADD CONSTRAINT student_tokens_student_id_unique UNIQUE (student_id);


--
-- Name: student_video_ratings student_video_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_video_ratings
    ADD CONSTRAINT student_video_ratings_pkey PRIMARY KEY (id);


--
-- Name: student_videos student_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_videos
    ADD CONSTRAINT student_videos_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_username_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_username_unique UNIQUE (username);


--
-- Name: user_tokens user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_tokens user_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_token_unique UNIQUE (token);


--
-- Name: user_tokens user_tokens_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_user_id_unique UNIQUE (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_activity_timers video_activity_timers_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_activity_timers
    ADD CONSTRAINT video_activity_timers_pkey PRIMARY KEY (id);


--
-- Name: video_categories video_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: attached_exams_attached_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX attached_exams_attached_id_index ON public.attached_exams USING btree (attached_id);


--
-- Name: book_chapters_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_chapters_book_id_index ON public.book_chapters USING btree (book_id);


--
-- Name: book_content_attachments_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_content_attachments_content_id_index ON public.book_content_attachments USING btree (content_id);


--
-- Name: book_content_images_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_content_images_content_id_index ON public.book_content_images USING btree (content_id);


--
-- Name: book_content_resources_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_content_resources_content_id_index ON public.book_content_resources USING btree (content_id);


--
-- Name: book_contents_subchapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_contents_subchapter_id_index ON public.book_contents USING btree (subchapter_id);


--
-- Name: book_subchapters_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX book_subchapters_chapter_id_index ON public.book_subchapters USING btree (chapter_id);


--
-- Name: books_external_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX books_external_id_index ON public.books USING btree (external_id);


--
-- Name: chapter_admins_admin_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chapter_admins_admin_id_index ON public.chapter_admins USING btree (admin_id);


--
-- Name: chapter_admins_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chapter_admins_book_id_index ON public.chapter_admins USING btree (book_id);


--
-- Name: chapter_admins_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chapter_admins_chapter_id_index ON public.chapter_admins USING btree (chapter_id);


--
-- Name: chat_chapter_scores_student_book_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chat_chapter_scores_student_book_chapter_id_index ON public.chat_chapter_scores USING btree (student_book_chapter_id);


--
-- Name: chat_chapter_scores_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chat_chapter_scores_student_id_index ON public.chat_chapter_scores USING btree (student_id);


--
-- Name: chat_history_student_book_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chat_history_student_book_chapter_id_index ON public.chat_history USING btree (student_book_chapter_id);


--
-- Name: chat_history_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX chat_history_student_id_index ON public.chat_history USING btree (student_id);


--
-- Name: course_books_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX course_books_book_id_index ON public.course_books USING btree (book_id);


--
-- Name: course_books_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX course_books_course_id_index ON public.course_books USING btree (course_id);


--
-- Name: course_end_date_days_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX course_end_date_days_exam_id_index ON public.course_end_date_days USING btree (exam_id);


--
-- Name: course_end_dates_course_id_end_date_unique_idx; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX course_end_dates_course_id_end_date_unique_idx ON public.course_end_dates USING btree (course_id, end_date);


--
-- Name: custom_event_groups_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX custom_event_groups_course_id_index ON public.custom_event_groups USING btree (course_id);


--
-- Name: custom_event_types_custom_event_group_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX custom_event_types_custom_event_group_id_index ON public.custom_event_types USING btree (custom_event_group_id);


--
-- Name: exam_logs_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_logs_exam_id_index ON public.exam_logs USING btree (exam_id);


--
-- Name: exam_passage_time_metrics_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_passage_time_metrics_exam_id_index ON public.exam_passage_time_metrics USING btree (exam_id);


--
-- Name: exam_passage_time_metrics_exam_passage_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_passage_time_metrics_exam_passage_id_index ON public.exam_passage_time_metrics USING btree (exam_passage_id);


--
-- Name: exam_question_time_metrics_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_question_time_metrics_exam_id_index ON public.exam_question_time_metrics USING btree (exam_id);


--
-- Name: exam_question_time_metrics_exam_question_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_question_time_metrics_exam_question_id_index ON public.exam_question_time_metrics USING btree (exam_question_id);


--
-- Name: exam_score_stats_exam_id_score_unique_idx; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX exam_score_stats_exam_id_score_unique_idx ON public.exam_score_stats USING btree (exam_id, score);


--
-- Name: exam_type_scaled_score_templates_exam_type_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_type_scaled_score_templates_exam_type_id_index ON public.exam_type_scaled_score_templates USING btree (exam_type_id);


--
-- Name: exam_type_scaled_score_templates_template_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exam_type_scaled_score_templates_template_id_index ON public.exam_type_scaled_score_templates USING btree (template_id);


--
-- Name: exam_types_type_subtype_unique_idx; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX exam_types_type_subtype_unique_idx ON public.exam_types USING btree (type, subtype) WHERE (deleted_at IS NULL);


--
-- Name: exams_external_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX exams_external_id_index ON public.exams USING btree (external_id);


--
-- Name: exams_title_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX exams_title_unique ON public.exams USING btree (title) WHERE (deleted_at IS NULL);


--
-- Name: external_id_unique_idx; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX external_id_unique_idx ON public.courses USING btree (external_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_original_exam_question_id; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX idx_original_exam_question_id ON public.student_exam_passages USING btree (original_exam_passage_id);


--
-- Name: mcat_dates_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX mcat_dates_course_id_index ON public.mcat_dates USING btree (course_id);


--
-- Name: organization_admins_organization_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX organization_admins_organization_id_index ON public.organization_admins USING btree (organization_id);


--
-- Name: percentile_rank_exam_type_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX percentile_rank_exam_type_id_index ON public.percentile_rank USING btree (exam_type_id);


--
-- Name: salty_bucks_daily_log_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX salty_bucks_daily_log_student_id_index ON public.salty_bucks_daily_log USING btree (student_id);


--
-- Name: stopwatches_student_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX stopwatches_student_course_id_index ON public.stopwatches USING btree (student_course_id);


--
-- Name: student_attached_exams_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_attached_exams_course_id_index ON public.student_attached_exams USING btree (course_id);


--
-- Name: student_attached_exams_original_attached_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_attached_exams_original_attached_id_index ON public.student_attached_exams USING btree (original_attached_id);


--
-- Name: student_book_chapters_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_chapters_book_id_index ON public.student_book_chapters USING btree (book_id);


--
-- Name: student_book_chapters_chat_context_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_chapters_chat_context_id_index ON public.student_book_chapters USING btree (chat_context_id);


--
-- Name: student_book_chapters_original_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_chapters_original_chapter_id_index ON public.student_book_chapters USING btree (original_chapter_id);


--
-- Name: student_book_content_attachments_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_attachments_content_id_index ON public.student_book_content_attachments USING btree (content_id);


--
-- Name: student_book_content_attachments_original_attachment_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_attachments_original_attachment_id_index ON public.student_book_content_attachments USING btree (original_attachment_id);


--
-- Name: student_book_content_comments_original_book_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_comments_original_book_content_id_index ON public.student_book_content_comments USING btree (original_book_content_id);


--
-- Name: student_book_content_course_topics_student_book_content_id_inde; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_course_topics_student_book_content_id_inde ON public.student_book_content_course_topics USING btree (student_book_content_id);


--
-- Name: student_book_content_course_topics_student_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_course_topics_student_book_id_index ON public.student_book_content_course_topics USING btree (student_book_id);


--
-- Name: student_book_content_course_topics_student_course_topic_id_inde; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_course_topics_student_course_topic_id_inde ON public.student_book_content_course_topics USING btree (student_course_topic_id);


--
-- Name: student_book_content_flashcards_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_flashcards_content_id_index ON public.student_book_content_flashcards USING btree (content_id);


--
-- Name: student_book_content_flashcards_original_flashcard_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_flashcards_original_flashcard_id_index ON public.student_book_content_flashcards USING btree (original_flashcard_id);


--
-- Name: student_book_content_images_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_images_content_id_index ON public.student_book_content_images USING btree (content_id);


--
-- Name: student_book_content_images_original_image_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_images_original_image_id_index ON public.student_book_content_images USING btree (original_image_id);


--
-- Name: student_book_content_questions_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_questions_content_id_index ON public.student_book_content_questions USING btree (content_id);


--
-- Name: student_book_content_questions_original_content_question_id_ind; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_questions_original_content_question_id_ind ON public.student_book_content_questions USING btree (original_content_question_id);


--
-- Name: student_book_content_resources_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_resources_content_id_index ON public.student_book_content_resources USING btree (content_id);


--
-- Name: student_book_content_resources_external_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_resources_external_id_index ON public.student_book_content_resources USING btree (external_id);


--
-- Name: student_book_content_resources_original_resource_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_content_resources_original_resource_id_index ON public.student_book_content_resources USING btree (original_resource_id);


--
-- Name: student_book_contents_original_content_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_contents_original_content_id_index ON public.student_book_contents USING btree (original_content_id);


--
-- Name: student_book_contents_subchapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_contents_subchapter_id_index ON public.student_book_contents USING btree (subchapter_id);


--
-- Name: student_book_subchapters_chapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_subchapters_chapter_id_index ON public.student_book_subchapters USING btree (chapter_id);


--
-- Name: student_book_subchapters_original_subchapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_subchapters_original_subchapter_id_index ON public.student_book_subchapters USING btree (original_subchapter_id);


--
-- Name: student_book_videos_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_videos_student_id_index ON public.student_book_videos USING btree (student_id);


--
-- Name: student_book_videos_student_subchapter_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_videos_student_subchapter_id_index ON public.student_book_videos USING btree (student_subchapter_id);


--
-- Name: student_book_videos_video_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_book_videos_video_id_index ON public.student_book_videos USING btree (video_id);


--
-- Name: student_books_book_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_books_book_id_index ON public.student_books USING btree (book_id);


--
-- Name: student_books_course_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_books_course_id_index ON public.student_books USING btree (course_id);


--
-- Name: student_books_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_books_student_id_index ON public.student_books USING btree (student_id);


--
-- Name: student_calendar_events_student_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_calendar_events_student_exam_id_index ON public.student_calendar_events USING btree (student_exam_id);


--
-- Name: student_courses_mcat_date_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_courses_mcat_date_id_index ON public.student_courses USING btree (mcat_date_id);


--
-- Name: student_exam_logs_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exam_logs_exam_id_index ON public.student_exam_logs USING btree (exam_id);


--
-- Name: student_exam_passages_original_exam_question_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exam_passages_original_exam_question_id_index ON public.student_exam_passages USING btree (original_exam_passage_id);


--
-- Name: student_exam_passages_student_section_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exam_passages_student_section_id_index ON public.student_exam_passages USING btree (student_section_id);


--
-- Name: student_exam_questions_student_passage_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exam_questions_student_passage_id_index ON public.student_exam_questions USING btree (student_passage_id);


--
-- Name: student_exam_sections_student_exam_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exam_sections_student_exam_id_index ON public.student_exam_sections USING btree (student_exam_id);


--
-- Name: student_exams_access_period_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exams_access_period_index ON public.student_exams USING btree (access_period);


--
-- Name: student_exams_external_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exams_external_id_index ON public.student_exams USING btree (external_id);


--
-- Name: student_exams_student_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_exams_student_id_index ON public.student_exams USING btree (student_id);


--
-- Name: student_favourite_videos_resource_id_index; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE INDEX student_favourite_videos_resource_id_index ON public.student_favourite_videos USING btree (resource_id);


--
-- Name: student_favourite_videos_student_id_resource_id_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX student_favourite_videos_student_id_resource_id_unique ON public.student_favourite_videos USING btree (student_id, resource_id);


--
-- Name: students_email_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX students_email_unique ON public.students USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: students_external_id_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX students_external_id_unique ON public.students USING btree (external_id) WHERE (deleted_at IS NULL);


--
-- Name: video_categories_1_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX video_categories_1_unique ON public.video_categories USING btree (title, course_id, course_type) WHERE (end_date_id IS NULL);


--
-- Name: video_categories_2_unique; Type: INDEX; Schema: public; Owner: examkrackers_api
--

CREATE UNIQUE INDEX video_categories_2_unique ON public.video_categories USING btree (title, course_id, course_type, end_date_id) WHERE (end_date_id IS NOT NULL);


--
-- Name: student_attached_exams remove_attached_exam; Type: TRIGGER; Schema: public; Owner: examkrackers_api
--

CREATE TRIGGER remove_attached_exam AFTER DELETE ON public.student_attached_exams FOR EACH ROW EXECUTE FUNCTION public.remove_attached_exam();


--
-- Name: book_content_course_topics remove_chain_of_content_topics; Type: TRIGGER; Schema: public; Owner: examkrackers_api
--

CREATE TRIGGER remove_chain_of_content_topics AFTER DELETE ON public.book_content_course_topics FOR EACH ROW EXECUTE FUNCTION public.remove_chain_of_content_topics();


--
-- Name: book_content_course_topics remove_course_topic_comment_if_no_topics_attached; Type: TRIGGER; Schema: public; Owner: examkrackers_api
--

CREATE TRIGGER remove_course_topic_comment_if_no_topics_attached AFTER DELETE ON public.book_content_course_topics FOR EACH ROW EXECUTE FUNCTION public.remove_course_topic_comment_if_no_topics_attached();


--
-- Name: notifications set_is_paused_for_notification; Type: TRIGGER; Schema: public; Owner: examkrackers_api
--

CREATE TRIGGER set_is_paused_for_notification BEFORE INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_is_paused_for_notification();


--
-- Name: amino_acid_games amino_acid_games_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.amino_acid_games
    ADD CONSTRAINT amino_acid_games_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: attached_exams attached_exams_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.attached_exams
    ADD CONSTRAINT attached_exams_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: book_admins book_admins_admin_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_admins
    ADD CONSTRAINT book_admins_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: book_admins book_admins_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_admins
    ADD CONSTRAINT book_admins_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: book_chapter_images book_chapter_images_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_chapter_images
    ADD CONSTRAINT book_chapter_images_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.book_chapters(id);


--
-- Name: book_chapters book_chapters_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_chapters
    ADD CONSTRAINT book_chapters_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: book_content_attachments book_content_attachments_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_attachments
    ADD CONSTRAINT book_content_attachments_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.book_contents(id) ON DELETE CASCADE;


--
-- Name: book_content_comments book_content_comments_book_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_comments
    ADD CONSTRAINT book_content_comments_book_content_id_foreign FOREIGN KEY (book_content_id) REFERENCES public.book_contents(id);


--
-- Name: book_content_comments book_content_comments_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_comments
    ADD CONSTRAINT book_content_comments_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: book_content_course_topics book_content_course_topics_book_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_course_topics
    ADD CONSTRAINT book_content_course_topics_book_content_id_foreign FOREIGN KEY (book_content_id) REFERENCES public.book_contents(id);


--
-- Name: book_content_course_topics book_content_course_topics_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_course_topics
    ADD CONSTRAINT book_content_course_topics_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: book_content_course_topics book_content_course_topics_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_course_topics
    ADD CONSTRAINT book_content_course_topics_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: book_content_course_topics book_content_course_topics_course_topic_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_course_topics
    ADD CONSTRAINT book_content_course_topics_course_topic_id_foreign FOREIGN KEY (course_topic_id) REFERENCES public.course_topics(id);


--
-- Name: book_content_flashcards book_content_flashcards_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_flashcards
    ADD CONSTRAINT book_content_flashcards_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.book_contents(id);


--
-- Name: book_content_flashcards book_content_flashcards_flashcard_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_flashcards
    ADD CONSTRAINT book_content_flashcards_flashcard_id_foreign FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id);


--
-- Name: book_content_images book_content_images_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_images
    ADD CONSTRAINT book_content_images_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.book_contents(id);


--
-- Name: book_content_questions book_content_questions_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_questions
    ADD CONSTRAINT book_content_questions_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.book_contents(id);


--
-- Name: book_content_questions book_content_questions_question_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_questions
    ADD CONSTRAINT book_content_questions_question_id_foreign FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: book_content_questions book_content_questions_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_questions
    ADD CONSTRAINT book_content_questions_subchapter_id_foreign FOREIGN KEY (subchapter_id) REFERENCES public.book_subchapters(id) ON DELETE CASCADE;


--
-- Name: book_content_resources book_content_resources_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_content_resources
    ADD CONSTRAINT book_content_resources_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.book_contents(id) ON DELETE CASCADE;


--
-- Name: book_contents book_contents_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_contents
    ADD CONSTRAINT book_contents_subchapter_id_foreign FOREIGN KEY (subchapter_id) REFERENCES public.book_subchapters(id) ON DELETE CASCADE;


--
-- Name: book_erratas book_erratas_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_erratas
    ADD CONSTRAINT book_erratas_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_erratas book_erratas_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_erratas
    ADD CONSTRAINT book_erratas_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.book_chapters(id) ON DELETE CASCADE;


--
-- Name: book_erratas book_erratas_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_erratas
    ADD CONSTRAINT book_erratas_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: book_erratas book_erratas_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_erratas
    ADD CONSTRAINT book_erratas_subchapter_id_foreign FOREIGN KEY (subchapter_id) REFERENCES public.book_subchapters(id) ON DELETE CASCADE;


--
-- Name: book_subchapters book_subchapters_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.book_subchapters
    ADD CONSTRAINT book_subchapters_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.book_chapters(id);


--
-- Name: calendar_chapter_exams calendar_chapter_exams_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapter_exams
    ADD CONSTRAINT calendar_chapter_exams_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: calendar_chapter_exams calendar_chapter_exams_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapter_exams
    ADD CONSTRAINT calendar_chapter_exams_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: calendar_chapters calendar_chapters_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapters
    ADD CONSTRAINT calendar_chapters_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.book_chapters(id) ON DELETE CASCADE;


--
-- Name: calendar_chapters calendar_chapters_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_chapters
    ADD CONSTRAINT calendar_chapters_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: calendar_full_exams calendar_full_exams_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_full_exams
    ADD CONSTRAINT calendar_full_exams_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: calendar_full_exams calendar_full_exams_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_full_exams
    ADD CONSTRAINT calendar_full_exams_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: calendar_section_exams calendar_section_exams_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_section_exams
    ADD CONSTRAINT calendar_section_exams_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: calendar_section_exams calendar_section_exams_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_section_exams
    ADD CONSTRAINT calendar_section_exams_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: calendar_settings calendar_settings_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.calendar_settings
    ADD CONSTRAINT calendar_settings_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: chapter_admins chapter_admins_admin_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chapter_admins
    ADD CONSTRAINT chapter_admins_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: chapter_admins chapter_admins_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chapter_admins
    ADD CONSTRAINT chapter_admins_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: chapter_admins chapter_admins_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chapter_admins
    ADD CONSTRAINT chapter_admins_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.book_chapters(id);


--
-- Name: chat_chapter_scores chat_chapter_scores_student_book_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_chapter_scores
    ADD CONSTRAINT chat_chapter_scores_student_book_chapter_id_foreign FOREIGN KEY (student_book_chapter_id) REFERENCES public.student_book_chapters(id) ON DELETE CASCADE;


--
-- Name: chat_chapter_scores chat_chapter_scores_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_chapter_scores
    ADD CONSTRAINT chat_chapter_scores_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: chat_history chat_history_student_book_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_student_book_chapter_id_foreign FOREIGN KEY (student_book_chapter_id) REFERENCES public.student_book_chapters(id) ON DELETE CASCADE;


--
-- Name: chat_history chat_history_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: course_books course_books_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: course_books course_books_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_books course_books_free_trial_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_free_trial_exam_id_foreign FOREIGN KEY (free_trial_exam_id) REFERENCES public.exams(id);


--
-- Name: course_end_date_days course_end_date_days_book_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_date_days
    ADD CONSTRAINT course_end_date_days_book_chapter_id_foreign FOREIGN KEY (book_chapter_id) REFERENCES public.book_chapters(id) ON DELETE CASCADE;


--
-- Name: course_end_date_days course_end_date_days_end_date_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_date_days
    ADD CONSTRAINT course_end_date_days_end_date_id_foreign FOREIGN KEY (end_date_id) REFERENCES public.course_end_dates(id) ON DELETE CASCADE;


--
-- Name: course_end_date_days course_end_date_days_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_date_days
    ADD CONSTRAINT course_end_date_days_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE SET NULL;


--
-- Name: course_end_dates course_end_dates_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_end_dates
    ADD CONSTRAINT course_end_dates_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_map course_map_book_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_map
    ADD CONSTRAINT course_map_book_course_id_foreign FOREIGN KEY (book_course_id) REFERENCES public.courses(id);


--
-- Name: course_topics course_topics_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.course_topics
    ADD CONSTRAINT course_topics_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: custom_event_groups custom_event_groups_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.custom_event_groups
    ADD CONSTRAINT custom_event_groups_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: custom_event_types custom_event_types_custom_event_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.custom_event_types
    ADD CONSTRAINT custom_event_types_custom_event_group_id_foreign FOREIGN KEY (custom_event_group_id) REFERENCES public.custom_event_groups(id) ON DELETE CASCADE;


--
-- Name: exam_erratas exam_erratas_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_erratas
    ADD CONSTRAINT exam_erratas_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: exam_erratas exam_erratas_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_erratas
    ADD CONSTRAINT exam_erratas_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_intro_pages exam_intro_pages_exam_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_intro_pages
    ADD CONSTRAINT exam_intro_pages_exam_type_id_foreign FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: exam_logs exam_logs_admin_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_logs
    ADD CONSTRAINT exam_logs_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: exam_logs exam_logs_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_logs
    ADD CONSTRAINT exam_logs_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_passage_time_metrics exam_passage_time_metrics_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passage_time_metrics
    ADD CONSTRAINT exam_passage_time_metrics_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_passage_time_metrics exam_passage_time_metrics_exam_passage_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passage_time_metrics
    ADD CONSTRAINT exam_passage_time_metrics_exam_passage_id_foreign FOREIGN KEY (exam_passage_id) REFERENCES public.exam_passages(id);


--
-- Name: exam_passages exam_passages_section_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_passages
    ADD CONSTRAINT exam_passages_section_id_foreign FOREIGN KEY (section_id) REFERENCES public.exam_sections(id);


--
-- Name: exam_question_time_metrics exam_question_time_metrics_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_question_time_metrics
    ADD CONSTRAINT exam_question_time_metrics_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_question_time_metrics exam_question_time_metrics_exam_question_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_question_time_metrics
    ADD CONSTRAINT exam_question_time_metrics_exam_question_id_foreign FOREIGN KEY (exam_question_id) REFERENCES public.exam_questions(id);


--
-- Name: exam_score_map exam_score_map_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_score_map
    ADD CONSTRAINT exam_score_map_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_score_stats exam_score_stats_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_score_stats
    ADD CONSTRAINT exam_score_stats_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_scores exam_scores_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_scores
    ADD CONSTRAINT exam_scores_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_section_score_map exam_section_score_map_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_section_score_map
    ADD CONSTRAINT exam_section_score_map_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_section_score_map exam_section_score_map_section_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_section_score_map
    ADD CONSTRAINT exam_section_score_map_section_id_foreign FOREIGN KEY (section_id) REFERENCES public.exam_sections(id);


--
-- Name: exam_section_scores exam_section_scores_section_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_section_scores
    ADD CONSTRAINT exam_section_scores_section_id_foreign FOREIGN KEY (section_id) REFERENCES public.exam_sections(id);


--
-- Name: exam_sections exam_sections_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_sections
    ADD CONSTRAINT exam_sections_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_type_scaled_score_templates exam_type_scaled_score_templates_exam_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_type_scaled_score_templates
    ADD CONSTRAINT exam_type_scaled_score_templates_exam_type_id_foreign FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: exam_type_scaled_score_templates exam_type_scaled_score_templates_template_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exam_type_scaled_score_templates
    ADD CONSTRAINT exam_type_scaled_score_templates_template_id_foreign FOREIGN KEY (template_id) REFERENCES public.scaled_score_templates(id);


--
-- Name: exams exams_exam_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_exam_type_id_foreign FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: exams exams_layout_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_layout_id_foreign FOREIGN KEY (layout_id) REFERENCES public.layouts(id);


--
-- Name: exams exams_review_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_review_video_id_foreign FOREIGN KEY (review_video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: exams exams_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.admins(id);


--
-- Name: favourite_videos favourite_videos_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.favourite_videos
    ADD CONSTRAINT favourite_videos_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: favourite_videos favourite_videos_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.favourite_videos
    ADD CONSTRAINT favourite_videos_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: flashcard_activity_timers flashcard_activity_timers_flashcard_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcard_activity_timers
    ADD CONSTRAINT flashcard_activity_timers_flashcard_id_foreign FOREIGN KEY (flashcard_id) REFERENCES public.student_book_content_flashcards(id);


--
-- Name: flashcard_activity_timers flashcard_activity_timers_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcard_activity_timers
    ADD CONSTRAINT flashcard_activity_timers_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id) ON DELETE CASCADE;


--
-- Name: flashcard_activity_timers flashcard_activity_timers_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcard_activity_timers
    ADD CONSTRAINT flashcard_activity_timers_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: flashcard_activity_timers flashcard_activity_timers_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.flashcard_activity_timers
    ADD CONSTRAINT flashcard_activity_timers_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: group_tutoring_days group_tutoring_days_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.group_tutoring_days
    ADD CONSTRAINT group_tutoring_days_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: hangman_answered_phrases hangman_answered_phrases_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_answered_phrases
    ADD CONSTRAINT hangman_answered_phrases_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: hangman_games hangman_games_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_games
    ADD CONSTRAINT hangman_games_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: hangman_hints hangman_hints_phrase_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.hangman_hints
    ADD CONSTRAINT hangman_hints_phrase_id_foreign FOREIGN KEY (phrase_id) REFERENCES public.hangman_phrases(id) ON DELETE CASCADE;


--
-- Name: mcat_dates mcat_dates_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.mcat_dates
    ADD CONSTRAINT mcat_dates_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_author_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_author_id_foreign FOREIGN KEY (author_id) REFERENCES public.admins(id);


--
-- Name: onboarding_images onboarding_images_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.onboarding_images
    ADD CONSTRAINT onboarding_images_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.onboarding_categories(id) ON DELETE CASCADE;


--
-- Name: organization_admins organization_admins_organization_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.organization_admins
    ADD CONSTRAINT organization_admins_organization_id_foreign FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: percentile_rank percentile_rank_exam_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.percentile_rank
    ADD CONSTRAINT percentile_rank_exam_type_id_foreign FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: respiration_games respiration_games_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.respiration_games
    ADD CONSTRAINT respiration_games_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: salty_bucks_daily_log salty_bucks_daily_log_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.salty_bucks_daily_log
    ADD CONSTRAINT salty_bucks_daily_log_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: salty_bucks_logs salty_bucks_logs_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.salty_bucks_logs
    ADD CONSTRAINT salty_bucks_logs_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: scaled_scores scaled_scores_template_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.scaled_scores
    ADD CONSTRAINT scaled_scores_template_id_foreign FOREIGN KEY (template_id) REFERENCES public.scaled_score_templates(id);


--
-- Name: stopwatches stopwatches_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.stopwatches
    ADD CONSTRAINT stopwatches_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: stopwatches stopwatches_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.stopwatches
    ADD CONSTRAINT stopwatches_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_attached_exams student_attached_exams_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_attached_exams
    ADD CONSTRAINT student_attached_exams_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_attached_exams student_attached_exams_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_attached_exams
    ADD CONSTRAINT student_attached_exams_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.student_exams(id);


--
-- Name: student_book_activity_timers student_book_activity_timers_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_activity_timers
    ADD CONSTRAINT student_book_activity_timers_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id) ON DELETE CASCADE;


--
-- Name: student_book_activity_timers student_book_activity_timers_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_activity_timers
    ADD CONSTRAINT student_book_activity_timers_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_book_activity_timers student_book_activity_timers_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_activity_timers
    ADD CONSTRAINT student_book_activity_timers_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_book_chapter_activity_timers student_book_chapter_activity_timers_student_book_chapter_id_fo; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_activity_timers
    ADD CONSTRAINT student_book_chapter_activity_timers_student_book_chapter_id_fo FOREIGN KEY (student_book_chapter_id) REFERENCES public.student_book_chapters(id);


--
-- Name: student_book_chapter_activity_timers student_book_chapter_activity_timers_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_activity_timers
    ADD CONSTRAINT student_book_chapter_activity_timers_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id) ON DELETE CASCADE;


--
-- Name: student_book_chapter_activity_timers student_book_chapter_activity_timers_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_activity_timers
    ADD CONSTRAINT student_book_chapter_activity_timers_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_book_chapter_activity_timers student_book_chapter_activity_timers_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_activity_timers
    ADD CONSTRAINT student_book_chapter_activity_timers_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_book_chapter_images student_book_chapter_images_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapter_images
    ADD CONSTRAINT student_book_chapter_images_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.student_book_chapters(id) ON DELETE CASCADE;


--
-- Name: student_book_chapters student_book_chapters_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapters
    ADD CONSTRAINT student_book_chapters_book_id_foreign FOREIGN KEY (book_id) REFERENCES public.student_books(id) ON DELETE CASCADE;


--
-- Name: student_book_chapters student_book_chapters_bookmark_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_chapters
    ADD CONSTRAINT student_book_chapters_bookmark_id_foreign FOREIGN KEY (bookmark_id) REFERENCES public.student_book_contents(id);


--
-- Name: student_book_content_attachments student_book_content_attachments_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_attachments
    ADD CONSTRAINT student_book_content_attachments_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_content_comments student_book_content_comments_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_comments
    ADD CONSTRAINT student_book_content_comments_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_book_content_course_topics student_book_content_course_topics_student_book_content_id_fore; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_course_topics
    ADD CONSTRAINT student_book_content_course_topics_student_book_content_id_fore FOREIGN KEY (student_book_content_id) REFERENCES public.student_book_contents(id);


--
-- Name: student_book_content_course_topics student_book_content_course_topics_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_course_topics
    ADD CONSTRAINT student_book_content_course_topics_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id);


--
-- Name: student_book_content_course_topics student_book_content_course_topics_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_course_topics
    ADD CONSTRAINT student_book_content_course_topics_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_book_content_course_topics student_book_content_course_topics_student_course_topic_id_fore; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_course_topics
    ADD CONSTRAINT student_book_content_course_topics_student_course_topic_id_fore FOREIGN KEY (student_course_topic_id) REFERENCES public.student_course_topics(id);


--
-- Name: student_book_content_flashcards student_book_content_flashcards_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_flashcards
    ADD CONSTRAINT student_book_content_flashcards_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_content_images student_book_content_images_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_images
    ADD CONSTRAINT student_book_content_images_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_content_pins student_book_content_pins_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_pins
    ADD CONSTRAINT student_book_content_pins_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_content_questions student_book_content_questions_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_questions
    ADD CONSTRAINT student_book_content_questions_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_content_resources student_book_content_resources_content_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_content_resources
    ADD CONSTRAINT student_book_content_resources_content_id_foreign FOREIGN KEY (content_id) REFERENCES public.student_book_contents(id) ON DELETE CASCADE;


--
-- Name: student_book_contents_read student_book_contents_read_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents_read
    ADD CONSTRAINT student_book_contents_read_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id);


--
-- Name: student_book_contents_read student_book_contents_read_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents_read
    ADD CONSTRAINT student_book_contents_read_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_book_contents_read student_book_contents_read_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents_read
    ADD CONSTRAINT student_book_contents_read_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_book_contents student_book_contents_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_contents
    ADD CONSTRAINT student_book_contents_subchapter_id_foreign FOREIGN KEY (subchapter_id) REFERENCES public.student_book_subchapters(id) ON DELETE CASCADE;


--
-- Name: student_book_subchapter_notes student_book_subchapter_notes_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapter_notes
    ADD CONSTRAINT student_book_subchapter_notes_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_book_subchapter_notes student_book_subchapter_notes_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapter_notes
    ADD CONSTRAINT student_book_subchapter_notes_subchapter_id_foreign FOREIGN KEY (subchapter_id) REFERENCES public.student_book_subchapters(id) ON DELETE CASCADE;


--
-- Name: student_book_subchapters student_book_subchapters_chapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_subchapters
    ADD CONSTRAINT student_book_subchapters_chapter_id_foreign FOREIGN KEY (chapter_id) REFERENCES public.student_book_chapters(id) ON DELETE CASCADE;


--
-- Name: student_book_videos student_book_videos_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_videos
    ADD CONSTRAINT student_book_videos_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_book_videos student_book_videos_student_subchapter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_videos
    ADD CONSTRAINT student_book_videos_student_subchapter_id_foreign FOREIGN KEY (student_subchapter_id) REFERENCES public.student_book_subchapters(id) ON DELETE CASCADE;


--
-- Name: student_book_videos student_book_videos_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_book_videos
    ADD CONSTRAINT student_book_videos_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: student_books student_books_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_books
    ADD CONSTRAINT student_books_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_books student_books_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_books
    ADD CONSTRAINT student_books_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_box_flashcards student_box_flashcards_student_flashcard_box_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_box_flashcards
    ADD CONSTRAINT student_box_flashcards_student_flashcard_box_id_foreign FOREIGN KEY (student_flashcard_box_id) REFERENCES public.student_flashcard_boxes(id) ON DELETE CASCADE;


--
-- Name: student_box_flashcards student_box_flashcards_student_flashcard_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_box_flashcards
    ADD CONSTRAINT student_box_flashcards_student_flashcard_id_foreign FOREIGN KEY (student_flashcard_id) REFERENCES public.student_book_content_flashcards(id);


--
-- Name: student_calendar_days_off student_calendar_days_off_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_calendar_days_off
    ADD CONSTRAINT student_calendar_days_off_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_calendar_events student_calendar_events_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_calendar_events
    ADD CONSTRAINT student_calendar_events_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_calendar_events student_calendar_events_student_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_calendar_events
    ADD CONSTRAINT student_calendar_events_student_exam_id_foreign FOREIGN KEY (student_exam_id) REFERENCES public.student_exams(id) ON DELETE CASCADE;


--
-- Name: student_completion_meters student_completion_meters_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_completion_meters
    ADD CONSTRAINT student_completion_meters_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_completion_meters student_completion_meters_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_completion_meters
    ADD CONSTRAINT student_completion_meters_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_course_activity_timers student_course_activity_timers_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_activity_timers
    ADD CONSTRAINT student_course_activity_timers_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_course_activity_timers student_course_activity_timers_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_activity_timers
    ADD CONSTRAINT student_course_activity_timers_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_course_end_date_days student_course_end_date_days_course_end_date_days_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_end_date_days
    ADD CONSTRAINT student_course_end_date_days_course_end_date_days_id_foreign FOREIGN KEY (course_end_date_days_id) REFERENCES public.course_end_date_days(id) ON DELETE CASCADE;


--
-- Name: student_course_end_date_days student_course_end_date_days_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_end_date_days
    ADD CONSTRAINT student_course_end_date_days_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_course_topics student_course_topics_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_course_topics
    ADD CONSTRAINT student_course_topics_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_courses student_courses_end_date_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_end_date_id_foreign FOREIGN KEY (end_date_id) REFERENCES public.course_end_dates(id);


--
-- Name: student_courses student_courses_mcat_date_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_mcat_date_id_foreign FOREIGN KEY (mcat_date_id) REFERENCES public.mcat_dates(id) ON DELETE SET NULL;


--
-- Name: student_courses student_courses_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_exam_logs student_exam_logs_admin_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_logs
    ADD CONSTRAINT student_exam_logs_admin_id_foreign FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: student_exam_logs student_exam_logs_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_logs
    ADD CONSTRAINT student_exam_logs_exam_id_foreign FOREIGN KEY (exam_id) REFERENCES public.student_exams(id);


--
-- Name: student_exam_passages student_exam_passages_student_section_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_passages
    ADD CONSTRAINT student_exam_passages_student_section_id_foreign FOREIGN KEY (student_section_id) REFERENCES public.student_exam_sections(id) ON DELETE CASCADE;


--
-- Name: student_exam_scores student_exam_scores_exam_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_scores
    ADD CONSTRAINT student_exam_scores_exam_type_id_foreign FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: student_exam_scores student_exam_scores_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_scores
    ADD CONSTRAINT student_exam_scores_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_exam_sections student_exam_sections_student_exam_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exam_sections
    ADD CONSTRAINT student_exam_sections_student_exam_id_foreign FOREIGN KEY (student_exam_id) REFERENCES public.student_exams(id) ON DELETE CASCADE;


--
-- Name: student_exams student_exams_layout_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exams
    ADD CONSTRAINT student_exams_layout_id_foreign FOREIGN KEY (layout_id) REFERENCES public.layouts(id);


--
-- Name: student_exams student_exams_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_exams
    ADD CONSTRAINT student_exams_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_favourite_videos student_favourite_videos_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_favourite_videos
    ADD CONSTRAINT student_favourite_videos_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_favourite_videos student_favourite_videos_resource_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_favourite_videos
    ADD CONSTRAINT student_favourite_videos_resource_id_foreign FOREIGN KEY (resource_id) REFERENCES public.student_book_content_resources(id) ON DELETE CASCADE;


--
-- Name: student_favourite_videos student_favourite_videos_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_favourite_videos
    ADD CONSTRAINT student_favourite_videos_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_favourite_videos student_favourite_videos_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_favourite_videos
    ADD CONSTRAINT student_favourite_videos_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: student_flashcard_archive student_flashcard_archive_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_archive
    ADD CONSTRAINT student_flashcard_archive_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_flashcard_archive student_flashcard_archive_student_flashcard_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_archive
    ADD CONSTRAINT student_flashcard_archive_student_flashcard_id_foreign FOREIGN KEY (student_flashcard_id) REFERENCES public.student_book_content_flashcards(id);


--
-- Name: student_flashcard_boxes student_flashcard_boxes_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_boxes
    ADD CONSTRAINT student_flashcard_boxes_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id);


--
-- Name: student_flashcard_boxes student_flashcard_boxes_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_flashcard_boxes
    ADD CONSTRAINT student_flashcard_boxes_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_notifications student_notifications_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_notifications
    ADD CONSTRAINT student_notifications_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: student_notifications student_notifications_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_notifications
    ADD CONSTRAINT student_notifications_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_pin_variants student_pin_variants_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_pin_variants
    ADD CONSTRAINT student_pin_variants_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id) ON DELETE CASCADE;


--
-- Name: student_pin_variants student_pin_variants_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_pin_variants
    ADD CONSTRAINT student_pin_variants_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_tokens student_tokens_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_tokens
    ADD CONSTRAINT student_tokens_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_video_ratings student_video_ratings_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_video_ratings
    ADD CONSTRAINT student_video_ratings_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_video_ratings student_video_ratings_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_video_ratings
    ADD CONSTRAINT student_video_ratings_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: student_videos student_videos_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_videos
    ADD CONSTRAINT student_videos_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student_videos student_videos_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.student_videos
    ADD CONSTRAINT student_videos_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: user_tokens user_tokens_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_activity_timers video_activity_timers_student_book_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_activity_timers
    ADD CONSTRAINT video_activity_timers_student_book_id_foreign FOREIGN KEY (student_book_id) REFERENCES public.student_books(id);


--
-- Name: video_activity_timers video_activity_timers_student_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_activity_timers
    ADD CONSTRAINT video_activity_timers_student_course_id_foreign FOREIGN KEY (student_course_id) REFERENCES public.student_courses(id) ON DELETE CASCADE;


--
-- Name: video_activity_timers video_activity_timers_student_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_activity_timers
    ADD CONSTRAINT video_activity_timers_student_id_foreign FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: video_activity_timers video_activity_timers_video_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_activity_timers
    ADD CONSTRAINT video_activity_timers_video_id_foreign FOREIGN KEY (video_id) REFERENCES public.student_book_content_resources(id);


--
-- Name: video_categories video_categories_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: video_categories video_categories_end_date_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_end_date_id_foreign FOREIGN KEY (end_date_id) REFERENCES public.course_end_dates(id) ON DELETE CASCADE;


--
-- Name: videos videos_course_end_date_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: examkrackers_api
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_course_end_date_id_foreign FOREIGN KEY (course_end_date_id) REFERENCES public.course_end_dates(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--
