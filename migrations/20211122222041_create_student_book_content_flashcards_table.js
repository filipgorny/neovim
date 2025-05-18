const tableName = 'student_book_content_flashcards'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.uuid('original_flashcard_id').notNullable().index()
    table.text('question').notNullable()
    table.text('explanation').notNullable()
    table.string('question_image').notNullable()
    table.string('explanation_image').notNullable()
    table.integer('proficiency_level').defaultTo(1)

    table
    .foreign('content_id')
    .references('id')
    .inTable('student_book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
