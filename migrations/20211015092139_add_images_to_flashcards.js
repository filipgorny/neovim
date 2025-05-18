const tableName = 'book_content_flashcards'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.string('question_image')
    table.string('explanation_image')
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn('explanation_image')
    table.dropColumn('question_image')
  })
