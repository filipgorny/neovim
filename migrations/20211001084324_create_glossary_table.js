const tableName = 'glossary'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('phrase').notNullable().unique()
    table.text('explanation').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
