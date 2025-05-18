const tableName = 'hangman_games'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.integer('amount_correct').notNullable()
    table.integer('amount_incorrect').notNullable()
    table.integer('score').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
