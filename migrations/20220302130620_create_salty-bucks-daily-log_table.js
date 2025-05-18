const tableName = 'salty_bucks_daily_log'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable().index()
    table.date('created_at').notNullable().defaultTo(knex.fn.now())
    table.integer('balance')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')

    table.unique(['student_id', 'created_at'])
  })

const dropTable = knex => knex.schema.dropTable(tableName)
