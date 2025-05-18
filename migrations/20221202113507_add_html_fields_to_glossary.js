const tableName = 'glossary'
const phraseColumnName = 'phrase_html'
const explanationColumnName = 'explanation_html'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.text(phraseColumnName)
    table.text(explanationColumnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(phraseColumnName)
    table.dropColumn(explanationColumnName)
  })
)
