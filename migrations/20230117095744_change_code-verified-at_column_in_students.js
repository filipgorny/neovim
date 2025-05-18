const tableName = 'students'
const columnToDrop = 'code_verified_at'
const codeExpiresAtColumn = 'code_expires_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnToDrop)
    table.timestamp(codeExpiresAtColumn).nullable()
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.date(columnToDrop).nullable()
    table.dropColumn(codeExpiresAtColumn)
  })
)
