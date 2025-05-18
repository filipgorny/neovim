const tableName = 'books'
const columnName = 'is_locked'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(false)
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
