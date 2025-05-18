const tableName = 'student_book_content_resources'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

/*
  down is exactly the same as up
  (changing column from notNull to nullable),
  the reason for it is that a migration wouldn't rollback
  in case when there would be nulls in those columns already,
  the other solution could be to set notNull with a default of empty string
  (causing more problems along the way)
*/

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text('raw').nullable().alter()
    table.text('delta_object').nullable().alter()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text('raw').nullable().alter()
    table.text('delta_object').nullable().alter()
  })
)
