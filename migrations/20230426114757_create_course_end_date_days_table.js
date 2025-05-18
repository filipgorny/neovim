const tableName = 'course_end_date_days'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('end_date_id')
    table.string('weekday').notNullable()
    table.string('class_time').notNullable()

    table
      .foreign('end_date_id')
      .references('id')
      .inTable('course_end_dates')
      .onDelete('CASCADE')
  })
}

const dropTable = knex => knex.schema.dropTable(tableName)
