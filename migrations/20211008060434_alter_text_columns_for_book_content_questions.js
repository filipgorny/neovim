const tableName = 'book_content_questions'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('details', 'question')
    table.text('details').alter()
    table.text('correct_answers').alter()
    table.text('answer_distribution').nullable().alter()
  })

const down = knex => 
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('question', 'details')
    table.text('question').alter()
    table.text('correct_answers').alter()
    table.text('answer_distribution').nullable().alter()
  })
