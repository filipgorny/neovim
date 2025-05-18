const tableName = 'course_end_dates'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.date('end_date').notNullable()
    table.text('calendar_image_url').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
  })
  await knex.raw(`CREATE UNIQUE INDEX ${tableName}_course_id_end_date_unique_idx ON ${tableName} (course_id, end_date);`)
}

const dropTable = knex => knex.schema.dropTable(tableName)
