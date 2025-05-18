const tableName = 'salty_bucks_daily_log'
const columnDiff1Name = 'balance_diff_1'
const columnDiff7Name = 'balance_diff_7'
const columnDiff30Name = 'balance_diff_30'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.integer(columnDiff1Name)
    table.integer(columnDiff7Name)
    table.integer(columnDiff30Name)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnDiff1Name)
    table.dropColumn(columnDiff7Name)
    table.dropColumn(columnDiff30Name)
  })
)
