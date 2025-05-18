const tableName = 'notifications'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.alterTable(tableName, table => {
    table.dropColumn('title_delta_object')
    table.dropColumn('title_html')
    table.renameColumn('title_raw', 'title')
  })
)

const down = knex => (
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('title', 'title_raw')
    table.text('title_delta_object').notNullable()
    table.text('title_html').notNullable()
  })
)
