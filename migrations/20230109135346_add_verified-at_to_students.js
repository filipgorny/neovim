const tableName = 'students'
const codeVerifiedAtColumnName = 'code_verified_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.date(codeVerifiedAtColumnName).nullable()
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(codeVerifiedAtColumnName)
  })
)
