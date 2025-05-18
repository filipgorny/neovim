const tableName = 'hangman_phrases'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.string('image_hint').nullable().alter()
  })
)

const down = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.string('image_hint').notNullable().alter()
  })
)
