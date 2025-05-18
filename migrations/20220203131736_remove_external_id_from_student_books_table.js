const tableName = 'student_books'
const externalIdColumn = 'external_id'
const courseIdColumn = 'course_id'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = async (knex) => {
  await knex.raw(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_${courseIdColumn}_foreign;`)

  await knex.schema.table(tableName, table => {
    table.uuid(courseIdColumn).nullable().alter()
  })

  await knex.raw(`UPDATE ${tableName} SET ${courseIdColumn} = NULL where ${courseIdColumn} NOT IN (select distinct id from student_courses);`)

  await knex.schema.table(tableName, table => {
    table.dropColumn(externalIdColumn)

    table
      .foreign(courseIdColumn)
      .references('id')
      .inTable('student_courses')
  })
}


const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(externalIdColumn)
    table.dropForeign(courseIdColumn)
    table.uuid(courseIdColumn).nullable().alter()
  })
)
