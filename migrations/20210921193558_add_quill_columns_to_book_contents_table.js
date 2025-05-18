const tableName = 'book_contents'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('details')

    table.string('raw').notNullable()
    table.text('delta_object')
    table.timestamp('deleted_at')
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('raw')
    table.dropColumn('delta_object')
    table.dropColumn('deleted_at')

    table.string('details').default('').notNullable()
  })
)
