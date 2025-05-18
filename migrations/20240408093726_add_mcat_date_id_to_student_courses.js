const tableName = 'student_courses'
const columnName = 'mcat_date_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable().index()

    table
      .foreign(columnName)
      .references('id')
      .inTable('mcat_dates')
      .onDelete('SET NULL')

    table.dropColumn('mcat_at')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)

    table.date('mcat_at').nullable()
  })
)
