const tableName = 'students'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean('has_books').defaultTo(false)
    table.boolean('has_exams').defaultTo(false)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('has_books')
    table.dropColumn('has_exams')
  })
)
