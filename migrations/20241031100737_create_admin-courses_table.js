const tableName = 'admin_courses'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('admin_id').notNullable()
    table.uuid('course_id').notNullable()

    table
      .foreign('admin_id')
      .references('id')
      .inTable('admins')
      .onDelete('CASCADE')

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
