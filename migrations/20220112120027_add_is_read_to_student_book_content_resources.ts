const tableName_20220112120027 = 'student_book_content_resources'
const columnName_20220112120027 = 'is_read'

exports.up = async knex => addColumn_20210908122505(knex)
exports.down = async knex => dropColumn_20210908122505(knex)

const addColumn_20210908122505 = (knex) => (
  knex.schema.table(tableName_20220112120027, table => {
    table.boolean(columnName_20220112120027).defaultTo(false)
  })
)

const dropColumn_20210908122505 = (knex) => (
  knex.schema.table(tableName_20220112120027, table => {
    table.dropColumn(columnName_20220112120027)
  })
)
