const tableName = 'student_courses'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('book_course_id').notNullable()
    table.datetime('external_created_at').notNullable()
    table.string('title').notNullable()
    table.string('type').notNullable() // free_trial, on_demand, live_course
    table.datetime('accessible_from')
    table.datetime('accessible_to')
    table.boolean('is_ready') // is this needed?
    table.string('status').notNullable() // scheduled, ongoing, expired
    table.datetime('completed_to')

    table
    .foreign('student_id')
    .references('id')
    .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
