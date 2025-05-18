const tableName = 'course_tutors'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').nullable()
    table.string('name')
    table.text('bio').nullable()
    table.string('image_url').nullable()
    table.boolean('is_active').defaultTo(true)

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
