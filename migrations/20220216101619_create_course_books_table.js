const tableName = 'course_books'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('course_id').notNullable().index()
    table.uuid('book_id').notNullable().index()
    table.boolean('is_free_trial').defaultTo(false)
    table.uuid('free_trial_exam_id').nullable()

    table
      .foreign('free_trial_exam_id')
      .references('id')
      .inTable('exams')
    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      
    table
      .foreign('book_id')
      .references('id')
      .inTable('books')

    table.primary(['course_id', 'book_id'])
  })

const dropTable = knex => knex.schema.dropTable(tableName)
