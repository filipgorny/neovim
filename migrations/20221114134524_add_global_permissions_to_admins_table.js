const tableName = 'admins'
const columnNameExams = 'can_manage_exams'
const columnNameStudents = 'can_manage_students'
const columnNameCourses = 'can_manage_courses'
const columnNameAnimations = 'can_manage_animations'
const columnNameScoreTables = 'can_manage_score_tables'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameExams).notNullable().defaultTo(false)
    table.boolean(columnNameStudents).notNullable().defaultTo(false)
    table.boolean(columnNameCourses).notNullable().defaultTo(false)
    table.boolean(columnNameAnimations).notNullable().defaultTo(false)
    table.boolean(columnNameScoreTables).notNullable().defaultTo(false)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameExams)
    table.dropColumn(columnNameStudents)
    table.dropColumn(columnNameCourses)
    table.dropColumn(columnNameAnimations)
    table.dropColumn(columnNameScoreTables)
  })
)
