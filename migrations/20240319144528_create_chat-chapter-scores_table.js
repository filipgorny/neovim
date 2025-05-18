const tableName = 'chat_chapter_scores'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').index()
    table.uuid('student_book_chapter_id').index()
    table.integer('chapter_avg_score').defaultTo(0)
    table.integer('chapter_score_sum').defaultTo(0)
    table.integer('chapter_score_amount').defaultTo(0)

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('student_book_chapter_id')
      .references('id')
      .inTable('student_book_chapters')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
