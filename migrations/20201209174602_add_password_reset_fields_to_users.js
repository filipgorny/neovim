const tableName = 'users'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.string('password_reset_token')
    table.dateTime('password_reset_token_created_at')
  })
)

const dropColumns = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn('password_reset_token')
    table.dropColumn('password_reset_token_created_at')
  })
)
