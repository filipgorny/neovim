const tableName = 'students'
const columnNameA = 'is_frozen'
const columnNameB = 'freeze_reason'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameA).defaultTo(false)
    table.text(columnNameB).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
  })
)
