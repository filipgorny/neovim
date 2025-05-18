const tableName = 'questions'
const columnNameCorrectAmount = 'correct_answers_amount'
const columnNameAllAmount = 'all_answers_amount'
const columnNameDifficulty = 'difficulty_percentage'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.integer(columnNameCorrectAmount).defaultTo(0)
    table.integer(columnNameAllAmount).defaultTo(0)
    table.float(columnNameDifficulty).defaultTo(0)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameCorrectAmount)
    table.dropColumn(columnNameAllAmount)
    table.dropColumn(columnNameDifficulty)
  })
)
