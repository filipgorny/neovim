const tableName = 'hangman_answered_phrases'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.string('category').notNullable()
    table.text('answered_phrases_orders').notNullable().defaultTo('')
    table.unique(['student_id', 'category'])

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
