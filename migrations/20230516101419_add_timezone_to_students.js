const tableName = 'students'
const timezoneColumnName = 'timezone'
const useDefaultTimezoneColumnName = 'use_default_timezone'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(timezoneColumnName).nullable()
    table.boolean(useDefaultTimezoneColumnName).defaultTo(true)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(timezoneColumnName)
    table.dropColumn(useDefaultTimezoneColumnName)
  })
)
