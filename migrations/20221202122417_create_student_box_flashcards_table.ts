const tableName_20221202122417 = 'student_box_flashcards'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName_20221202122417, table => {
    table.uuid('id').primary()
    table.uuid('student_flashcard_box_id').notNullable()
    table.uuid('student_flashcard_id').notNullable()

    table
      .foreign('student_flashcard_box_id')
      .references('id')
      .inTable('student_flashcard_boxes')
      .onDelete('CASCADE')

    table
      .foreign('student_flashcard_id')
      .references('id')
      .inTable('student_book_content_flashcards')
  })

const dropTable = knex => knex.schema.dropTable(tableName_20221202122417)
