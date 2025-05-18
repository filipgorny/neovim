exports.up = async function(knex) {
    await knex.raw(`ALTER TABLE student_book_subchapter_notes DROP CONSTRAINT IF EXISTS student_book_subchapter_notes_student_id_subchapter_id_unique;`)
};

exports.down = async function(knex) {}
