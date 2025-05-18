const tableName = 'courses'
const columnNameA = 'ai_tutor_enabled'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameA).defaultTo(true)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
