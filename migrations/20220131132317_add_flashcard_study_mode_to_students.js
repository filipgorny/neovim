const tableName = 'students'
const columnName = 'flashcard_study_mode'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(columnName).defaultTo('front')
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
