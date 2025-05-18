const tableName = 'amino_acid_games'
const columnName = 'is_paused'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.boolean(columnName).notNullable().defaultTo(false)
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
