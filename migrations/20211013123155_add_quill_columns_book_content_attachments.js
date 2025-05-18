const tableName = 'book_content_attachments'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.renameColumn('details', 'raw')
    table.renameColumn('captions', 'delta_object')

    table.text('details').notNullable().alter()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.renameColumn('raw', 'details')
    table.renameColumn('delta_object', 'captions')

    table.text('raw').notNullable().alter()
  })
)
