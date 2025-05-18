const tableName = 'course_extensions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.string('external_id').notNullable()
    table.datetime('external_created_at').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
