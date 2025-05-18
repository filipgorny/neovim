const tableName = 'courses'
const columnNameA = 'dashboard_settings'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => {
  await knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })

  await knex.schema.table(tableName, table => {
    table.text(columnNameA).nullable()
  })
}

const down = async knex => {
  await knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })

  await knex.schema.table(tableName, table => {
    table.json(columnNameA).nullable()
  })
}
