const tableName = 'student_courses'
const calendarColumnName = 'calendar_start_at'
const examColumnName = 'exam_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.date(calendarColumnName).defaultTo(knex.fn.now())
    table.date(examColumnName)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(calendarColumnName)
    table.dropColumn(examColumnName)
  })
)
