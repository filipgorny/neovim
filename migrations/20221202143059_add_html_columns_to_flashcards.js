const tableName = 'flashcards'
const questionColumnName = 'question_html'
const explanationColumnName = 'explanation_html'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.text(questionColumnName)
    table.text(explanationColumnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(questionColumnName)
    table.dropColumn(explanationColumnName)
  })
)
