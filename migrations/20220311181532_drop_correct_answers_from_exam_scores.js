const tableName = 'exam_scores'
const columnName = 'correct_answers'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })

const down = knex =>
  knex.schema.table(tableName, table => {
    table.integer(columnName).notNullable()
  })
