const tableName = 'exams'
const columnName = 'score_calculation_method'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.string(columnName).defaultTo('normal')
  })

const down = knex =>
knex.schema.table(tableName, table => {
  table.dropColumn(columnName)
})
