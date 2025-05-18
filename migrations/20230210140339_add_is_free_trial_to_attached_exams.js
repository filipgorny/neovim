const tableName = 'attached_exams'
const columnName = 'is_free_trial'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(false)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
