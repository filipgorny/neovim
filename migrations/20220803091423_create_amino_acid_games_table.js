const tableName = 'amino_acid_games'

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
    table.text('answers')
    table.boolean('blox_game_enabled')
    table.string('acid_names_difficulty')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
