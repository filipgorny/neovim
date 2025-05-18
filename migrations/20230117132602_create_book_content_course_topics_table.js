const tableName = 'book_content_course_topics'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.uuid('book_id').notNullable()
    table.uuid('book_content_id').notNullable()
    table.uuid('course_topic_id').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')

    table
      .foreign('book_id')
      .references('id')
      .inTable('books')

    table
      .foreign('book_content_id')
      .references('id')
      .inTable('book_contents')

    table
      .foreign('course_topic_id')
      .references('id')
      .inTable('course_topics')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
