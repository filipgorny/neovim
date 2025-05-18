const tableName = 'calendar_settings'
const oldColumnName = 'preferred_day_full_length_exam'
const newColumnName = 'preferred_days_full_length_exam'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(oldColumnName)

    table.json(newColumnName).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(newColumnName)

    table.integer(oldColumnName).nullable()
  })
)
