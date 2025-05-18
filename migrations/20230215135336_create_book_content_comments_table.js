const tableName = 'book_content_comments'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.uuid('book_content_id').notNullable()
    table.text('comment_html')
    table.text('comment_raw')
    table.text('comment_delta_object')

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')

    table
      .foreign('book_content_id')
      .references('id')
      .inTable('book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
