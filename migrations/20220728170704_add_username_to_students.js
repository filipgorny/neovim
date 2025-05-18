const tableName = 'students'
const columnName = 'username'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.string(columnName).nullable().unique()
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
