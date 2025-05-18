const tableName = 'books'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.dropColumn('course_id')
  })

const down = knex =>
knex.schema.table(tableName, table => {
  table.uuid('course_id').nullable().index()
  
  table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
})
