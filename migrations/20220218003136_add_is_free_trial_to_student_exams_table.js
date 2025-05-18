const tableName = 'student_exams'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.boolean('is_free_trial').default(false)
  })

const down = knex =>
knex.schema.table(tableName, table => {
  table.dropColumn('is_free_trial')
})
