const tableName = 'ai_tutor_scores'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id')
    table.uuid('student_book_chapter_id')
    table.integer('score').defaultTo(0)
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')

    table
      .foreign('student_book_chapter_id')
      .references('id')
      .inTable('student_book_chapters')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
