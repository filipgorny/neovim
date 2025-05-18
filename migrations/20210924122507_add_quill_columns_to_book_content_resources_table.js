const tableName = 'book_content_resources'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('details')

    table.string('raw').notNullable()
    table.text('delta_object')
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('raw')
    table.dropColumn('delta_object')

    table.string('details').default('').notNullable()
  })
)
