const moment = require('moment')
const tableName = 'student_exams'
const columnName = 'external_created_at'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.date(columnName).default(moment().format('YYYY-MM-DD'))
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)

