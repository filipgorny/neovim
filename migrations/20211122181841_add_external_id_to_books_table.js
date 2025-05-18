const tableName = 'books'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.string('external_id').index().unique()
  })
)

const dropColumns = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn('external_id')
  })
)
