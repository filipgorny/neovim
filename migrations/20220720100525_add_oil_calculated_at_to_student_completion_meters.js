const tableName = 'student_completion_meters'
const columnName = 'oil_calculated_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.date(columnName).nullable()
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
