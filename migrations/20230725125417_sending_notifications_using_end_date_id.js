
exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.raw('drop function if exists get_target_student_courses(text, uuid, text);')

  await knex.raw('drop function if exists send_notification(uuid, text, text, text, text, uuid, text, uuid, text);')

  await knex.raw('drop function if exists get_target_students(text, uuid, text);')

  await knex.raw(`
    create or replace function get_target_student_courses(
      course_type text,
      course_id_arg uuid,
      --metadata_arg text default null
      days_amount_arg text default null,
      end_date_id_arg uuid default null,
      expires_at text default null
    )
    returns table (student_id uuid, student_course_id uuid) as
    $$
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
    $$
    language plpgsql;
  `)

  await knex.raw(`
    create or replace function send_notification(
      author_id_arg uuid,
      title_arg text,
      description_raw_arg text,
      description_delta_object_arg text,
      description_html_arg text,
      notification_id_arg uuid,
      course_type text default null,
      course_id_arg uuid default null,
      -- metadata_arg text default null
      days_amount_arg text default null,
      end_date_id_arg uuid default null,
      expires_at text default null
    )
    returns void as
    $$
    declare
        student_id uuid;
        student_course_id uuid;
    begin
      if course_type is null then
        for student_id in (select id from students where deleted_at is null)
        loop
          insert into student_notifications (id, author_id, created_at, title, description_raw, description_delta_object, description_html, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), title_arg, description_raw_arg, description_delta_object_arg, description_html_arg, student_id, null, notification_id_arg);
        end loop;
      else
        for student_id, student_course_id in (select * from get_target_student_courses(course_type, course_id_arg, days_amount_arg, end_date_id_arg, expires_at))
        loop
          insert into student_notifications (id, author_id, created_at, title, description_raw, description_delta_object, description_html, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), title_arg, description_raw_arg, description_delta_object_arg, description_html_arg, student_id, student_course_id, notification_id_arg);
        end loop;
      end if;
    end;
    $$
    language plpgsql;
  `)

  await knex.raw(`
    create or replace function get_target_students(
      course_type text,
      course_id_arg uuid,
      --metadata_arg text default null
      days_amount_arg text default null,
      end_date_id_arg uuid default null,
      expires_at text default null
    )
    returns table (student_id uuid) as
    $$
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
    $$
    language plpgsql;
  `)
}


const down = async knex => {
  await knex.raw('drop function if exists get_target_student_courses(text, uuid, text, uuid, text);')

  await knex.raw('drop function if exists send_notification(uuid, text, text, text, text, uuid, text, uuid, text, uuid, text);')

  await knex.raw('drop function if exists get_target_students(text, uuid, text, uuid, text);')

  await knex.raw(`
    create or replace function get_target_student_courses(
      course_type text,
      course_id_arg uuid,
      metadata_arg text default null
    )
    returns table (student_id uuid, student_course_id uuid) as
    $$
    begin
      if metadata_arg is null then
        return query select sc.student_id, sc.id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg;
      else
        if course_type = 'on_demand' then
            return query select sc.student_id, sc.id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata = '%"days_amount":"' || metadata_arg || '"%';
        else
            return query select sc.student_id, sc.id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata = '%"expires_at":"' || metadata_arg || '"%';
        end if;
      end if;
    end;
    $$
    language plpgsql;
  `)

  await knex.raw(`
    create or replace function send_notification(
      author_id_arg uuid,
      title_arg text,
      description_raw_arg text,
      description_delta_object_arg text,
      description_html_arg text,
      notification_id_arg uuid,
      course_type text default null,
      course_id_arg uuid default null,
      metadata_arg text default null
    )
    returns void as
    $$
    declare
        student_id uuid;
        student_course_id uuid;
    begin
      if course_type is null then
        for student_id in (select id from students where deleted_at is null)
        loop
          insert into student_notifications (id, author_id, created_at, title, description_raw, description_delta_object, description_html, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), title_arg, description_raw_arg, description_delta_object_arg, description_html_arg, student_id, null, notification_id_arg);
        end loop;
      else
        for student_id, student_course_id in (select * from get_target_student_courses(course_type, course_id_arg, metadata_arg))
        loop
          insert into student_notifications (id, author_id, created_at, title, description_raw, description_delta_object, description_html, student_id, student_course_id, notification_id) values (uuid_generate_v4(), author_id_arg, now(), title_arg, description_raw_arg, description_delta_object_arg, description_html_arg, student_id, student_course_id, notification_id_arg);
        end loop;
      end if;
    end;
    $$
    language plpgsql;
  `)

  await knex.raw(`
    create or replace function get_target_students(course_type text, course_id_arg uuid, metadata_arg text default null)
    returns table (student_id uuid) as
    $$
    begin
      if metadata_arg is null then
        return query select sc.student_id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg;
      else
        if course_type = 'on_demand' then
            return query select sc.student_id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata = '%"days_amount":"' || metadata_arg || '"%';
          else
            return query select sc.student_id from student_courses sc where sc."type" = course_type and sc.book_course_id = course_id_arg and sc.original_metadata = '%"expires_at":"' || metadata_arg || '"%';
          end if;
      end if;
    end;
    $$
    language plpgsql;
  `)
}
