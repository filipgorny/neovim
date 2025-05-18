const tableName = 'content_question_reactions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('type').notNullable()
    table.string('animation').notNullable()
    table.string('sound').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

const dropTable = knex => knex.schema.dropTable(tableName)
