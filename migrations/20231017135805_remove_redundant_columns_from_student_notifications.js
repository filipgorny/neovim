const tableName = 'student_notifications'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn('title')
    table.dropColumn('description_raw')
    table.dropColumn('description_delta_object')
    table.dropColumn('description_html')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.text('title').nullable()
    table.text('description_raw').nullable()
    table.text('description_delta_object').nullable()
    table.text('description_html').nullable()
  })
)
