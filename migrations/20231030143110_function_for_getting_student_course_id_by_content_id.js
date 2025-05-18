exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
    create or replace function get_student_course_id_by_student_book_content_id(content_id uuid)
    returns uuid as $$
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
    $$
    LANGUAGE plpgsql;
  `)
)

const down = async knex => (
  knex.raw(`
    DROP FUNCTION IF EXISTS get_student_course_id_by_student_book_content_id;
  `)
)
