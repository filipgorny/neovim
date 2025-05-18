const tableName = 'course_end_dates'
const startDateColumnName = 'start_date'
const linkColumnName = 'meeting_url'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.timestamp(startDateColumnName).nullable()
    table.string(linkColumnName).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(startDateColumnName)
    table.dropColumn(linkColumnName)
  })
)
