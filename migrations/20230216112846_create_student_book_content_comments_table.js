const tableName = 'student_book_content_comments'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.uuid('original_book_content_id').notNullable()
    table.text('comment_html')
    table.boolean('is_read').defaultTo(false)

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')

    table
      .foreign('original_book_content_id')
      .references('id')
      .inTable('book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
