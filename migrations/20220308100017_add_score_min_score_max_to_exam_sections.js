const tableName = 'exam_sections'
const columnNameScoreMin = 'score_min'
const columnNameScoreMax = 'score_max'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.integer(columnNameScoreMin)
    table.integer(columnNameScoreMax)
  })

const down = knex =>
knex.schema.table(tableName, table => {
  table.dropColumn(columnNameScoreMin)
  table.dropColumn(columnNameScoreMax)
})
