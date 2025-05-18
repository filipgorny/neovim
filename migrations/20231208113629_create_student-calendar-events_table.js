const tableName = 'student_calendar_events'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.string('title').notNullable()
    table.string('type').notNullable()
    table.string('status').notNullable()
    table.date('event_date').notNullable()
    table.integer('duration').notNullable()
    table.integer('order').notNullable()
    table.text('action_uri').notNullable()
    table.boolean('is_manual').defaultTo(false)

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
