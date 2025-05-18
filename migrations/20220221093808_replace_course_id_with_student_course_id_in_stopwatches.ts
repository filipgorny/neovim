const tableName_20220221093808 = 'stopwatches'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName_20220221093808, table => {
    table.dropColumn('course_id')
    table.uuid('student_course_id').notNullable().index()
  
  table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')

  table.primary(['student_course_id', 'student_id', 'date'])
})

const down = knex =>
knex.schema.table(tableName_20220221093808, table => {
  table.dropColumn('student_course_id')
  table.uuid('course_id').nullable().index()
  
  table
      .foreign('course_id')
      .references('id')
      .inTable('courses')

  table.primary(['course_id', 'student_id', 'date'])
})
