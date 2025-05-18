
exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
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
)


const down = async knex => {
  await knex.raw('drop function if exists get_target_students(text, uuid, text);')
}
