const tableName = 'exams'
const columnName = 'google_form_url'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.string(columnName)
  })

const down = knex =>
knex.schema.table(tableName, table => {
  table.dropColumn(columnName)
})
