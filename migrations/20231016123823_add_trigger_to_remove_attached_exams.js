exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
    CREATE OR REPLACE FUNCTION remove_attached_exam()
    RETURNS TRIGGER AS $$
    BEGIN
      DELETE FROM student_exams WHERE id = OLD.exam_id;
      RETURN OLD;
    END;
    $$
    LANGUAGE plpgsql;
    
    CREATE TRIGGER remove_attached_exam
    AFTER DELETE ON student_attached_exams
    FOR EACH ROW
    EXECUTE FUNCTION remove_attached_exam();
  `)
)

const down = async knex => (
  knex.raw(`
    DROP TRIGGER remove_attached_exam
    ON student_attached_exams;

    DROP FUNCTION IF EXISTS remove_attached_exam;
  `)
)
