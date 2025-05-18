const tableName = 'exam_types'
const columnName = 'section_titles'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.text(columnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
