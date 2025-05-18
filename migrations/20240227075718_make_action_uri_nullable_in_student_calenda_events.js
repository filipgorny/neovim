const tableName = 'student_calendar_events'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.text('action_uri').nullable().alter()
  })
)

const dropColumns = knex => (
  knex.schema.alterTable(tableName, table => {
    table.text('action_uri').notNullable().alter()
  })
)
