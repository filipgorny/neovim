const tableName = 'course_end_dates'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.text('calendar_image_url').nullable().alter()
  })
)

const down = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.text('calendar_image_url').notNullable().alter()
  })
)
