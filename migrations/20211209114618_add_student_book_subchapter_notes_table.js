const TABLE_NAME = 'student_book_subchapter_notes'
const SUBCHAPTER_ID_COLUMN_NAME = 'subchapter_id'
const STUDENT_ID_COLUMN_NAME = 'student_id'

exports.up = async (knex) => {
    await knex.schema.createTable(TABLE_NAME, table => {
        table
            .uuid('id')
            .primary()

        table
            .uuid(STUDENT_ID_COLUMN_NAME)
            .notNullable()

        table
            .uuid(SUBCHAPTER_ID_COLUMN_NAME)
            .notNullable()

        table
            .text('raw')
            .notNullable()

        table
            .text('delta_object')
            .notNullable()

        table.unique([STUDENT_ID_COLUMN_NAME,SUBCHAPTER_ID_COLUMN_NAME])

        table
            .foreign(SUBCHAPTER_ID_COLUMN_NAME)
            .references('id')
            .inTable('student_book_subchapters')

        table
            .foreign(STUDENT_ID_COLUMN_NAME)
            .references('id')
            .inTable('students')
    })
};

exports.down = async (knex) => {
    await knex.schema.dropTable(TABLE_NAME)
};
