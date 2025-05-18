const tableName = 'respiration_games'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.integer('score').notNullable()
    table.integer('correct_amount').notNullable()
    table.integer('incorrect_amount').notNullable()
    table.datetime('created_at').notNullable()
    table.text('answers').notNullable()
    table.boolean('blox_game_enabled').notNullable()
    table.string('difficulty')
    table.boolean('is_a_win').notNullable().defaultTo(false)
    table.boolean('is_paused').notNullable().defaultTo(false)

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
