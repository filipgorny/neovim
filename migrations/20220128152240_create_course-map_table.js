const tableName = 'course_map'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('book_course_id').notNullable()
    table.string('title').notNullable()
    table.string('external_id').unique()
    table.string('type')

    table
      .foreign('book_course_id')
      .references('id')
      .inTable('book_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
