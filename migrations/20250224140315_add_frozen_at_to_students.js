const tableName = 'students'
const columnName = 'frozen_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.timestamp(columnName).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
