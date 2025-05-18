const tableName = 'students'
const columnName2min = 'activity_streak_2min'
const columnName30min = 'activity_streak_30min'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.timestamp(columnName2min)
    table.timestamp(columnName30min)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName2min)
    table.dropColumn(columnName30min)
  })
)
