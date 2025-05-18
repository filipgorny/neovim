const tableName = 'calendar_settings'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.integer('preferred_day_full_length_exam').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
