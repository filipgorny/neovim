const tableName = 'exams'
const columnName = 'max_completions'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.integer(columnName).defaultTo(1)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
