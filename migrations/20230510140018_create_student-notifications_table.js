const tableName = 'student_notifications'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('author_id').notNullable()
    table.uuid('notification_id').notNullable()
    table.uuid('student_id').notNullable()
    table.uuid('student_course_id').nullable()
    table.timestamp('created_at').notNullable()
    table.boolean('is_read').notNullable().defaultTo(false)
    table.text('title_raw').notNullable()
    table.text('title_delta_object').notNullable()
    table.text('title_html').notNullable()
    table.text('description_raw').notNullable()
    table.text('description_delta_object').notNullable()
    table.text('description_html').notNullable()

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
