const tableName = 'videos'
const categoryColumnName = 'category'
const courseEndDateColumnName = 'course_end_date_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(categoryColumnName).defaultTo('books')
    table.uuid(courseEndDateColumnName).nullable()

    table
    .foreign(courseEndDateColumnName)
    .references('id')
    .inTable('course_end_dates')
    .onDelete('SET NULL')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(categoryColumnName)
    table.dropColumn(courseEndDateColumnName)
  })
)
