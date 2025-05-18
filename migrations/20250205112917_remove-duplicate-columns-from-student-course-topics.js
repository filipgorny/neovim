const tableName = 'student_course_topics'
const columnNameA = 'topic'
const columnNameB = 'order'
const columnNameC = 'level'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
    table.dropColumn(columnNameC)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.string(columnNameA)
    table.integer(columnNameB)
    table.integer(columnNameC)
  })
)
