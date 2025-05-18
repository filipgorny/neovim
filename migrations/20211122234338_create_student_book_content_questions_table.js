const tableName = 'student_book_content_questions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.uuid('original_content_question_id').notNullable().index()
    table.string('type').notNullable()
    table.integer('order').notNullable()
    table.text('question').notNullable()
    table.text('answer_definition').notNullable()
    table.string('correct_answers').notNullable()
    table.text('explanation').notNullable()
    table.text('answers')

    table
    .foreign('content_id')
    .references('id')
    .inTable('student_book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
