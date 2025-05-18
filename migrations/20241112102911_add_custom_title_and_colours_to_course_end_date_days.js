const tableName = 'course_end_date_days'
const columnNameA = 'custom_title'
const columnNameB = 'fill_colour_start'
const columnNameC = 'fill_colour_stop'
const columnNameD = 'font_colour'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(columnNameA).nullable()
    table.string(columnNameB).nullable()
    table.string(columnNameC).nullable()
    table.string(columnNameD).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
    table.dropColumn(columnNameC)
    table.dropColumn(columnNameD)
  })
)
