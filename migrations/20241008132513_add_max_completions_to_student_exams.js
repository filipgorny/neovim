const tableName = 'student_exams'
const columnNameA = 'max_completions'
const columnNameB = 'completions_done'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.integer(columnNameA).defaultTo(1)
    table.integer(columnNameB).defaultTo(0)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
  })
)
