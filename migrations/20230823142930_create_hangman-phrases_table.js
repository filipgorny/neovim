const tableName = 'hangman_phrases'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('phrase').notNullable()
    table.string('category').notNullable()
    table.string('image_hint').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('deleted_at').nullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
