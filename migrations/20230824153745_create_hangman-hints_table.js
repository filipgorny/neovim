const tableName = 'hangman_hints'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('hint_raw').notNullable()
    table.text('hint_delta_object').notNullable()
    table.text('hint_html').notNullable()
    table.integer('order').notNullable()
    table.uuid('phrase_id').notNullable()
    table.timestamps(true, true) // created_at, updated_at

    table
      .foreign('phrase_id')
      .references('id')
      .inTable('hangman_phrases')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
