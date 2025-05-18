const tableName = 'student_courses'
const columnAName = 'current_study_streak'
const columnBName = 'longest_study_streak'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.integer(columnAName).notNullable().defaultTo(0)
    table.integer(columnBName).notNullable().defaultTo(0)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnAName)
    table.dropColumn(columnBName)
  })
)
