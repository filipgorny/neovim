const tableName = 'student_book_chapter_activity_timers'
const columnName = 'activity_date'

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
