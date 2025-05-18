const TABLE_NAME = 'student_book_subchapter_notes'
const UNIQUE_COLUMN_NAMES = ['student_id', 'subchapter_id']


exports.up = async (knex) =>
    knex.schema.table(TABLE_NAME, table => {
        table.unique(UNIQUE_COLUMN_NAMES)
    })

exports.down = async (knex) =>
    knex.schema.table(TABLE_NAME, table => {
        table.dropUnique(UNIQUE_COLUMN_NAMES)
    })
