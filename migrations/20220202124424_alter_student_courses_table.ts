const tableName_20220202124424 = 'student_courses'

exports.up = async knex => addColumn_20220202124424(knex)
exports.down = async knex => dropColumn_20220202124424(knex)

const addColumn_20220202124424 = (knex) => (
  knex.schema.alterTable(tableName_20220202124424, table => {
    table.dropColumn('completed_to')

    table.datetime('accessible_from').nullable().alter()
    table.datetime('accessible_to').nullable().alter()
    table.datetime('completed_at')
  })
)

const dropColumn_20220202124424 = (knex) => (
  knex.schema.alterTable(tableName_20220202124424, table => {
    table.dropColumn('completed_at')

    table.datetime('accessible_from').alter()
    table.datetime('accessible_to').alter()
    table.datetime('completed_to')
  })
)
