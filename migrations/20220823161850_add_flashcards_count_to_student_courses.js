const tableName = 'student_courses'
const columnName = 'flashcard_count'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.bigInteger(columnName).notNullable().defaultTo(0)
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
