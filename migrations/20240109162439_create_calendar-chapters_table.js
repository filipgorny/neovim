const tableName = 'calendar_chapters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.uuid('chapter_id').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')

    table
      .foreign('chapter_id')
      .references('id')
      .inTable('book_chapters')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
