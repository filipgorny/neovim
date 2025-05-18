const tableName = 'students'
const columnName = 'is_ts_attached_to_pts'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex =>
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })

const down = async knex =>
  knex.schema.table(tableName, table => {
    table.boolean('is_ts_attached_to_pts').defaultTo(true)
  })
