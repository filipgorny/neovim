const tableName = 'course_end_dates'
const columnName = 'end_date'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.timestamp(columnName).alter()
  })

const down = knex => 
  knex.schema.alterTable(tableName, table => {
    table.date(columnName).alter()
  })
