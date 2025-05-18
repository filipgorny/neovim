const tableName = 'hangman_phrases'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('phrase', 'phrase_raw')
    table.text('phrase_delta_object').nullable()
    table.text('phrase_html').nullable()
  })
)

const down = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('phrase_raw', 'phrase')
    table.dropColumn('phrase_delta_object')
    table.dropColumn('phrase_html')
  })
)
