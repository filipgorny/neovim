const tableName = 'courses'
const columnName = 'max_exam_completions'

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
