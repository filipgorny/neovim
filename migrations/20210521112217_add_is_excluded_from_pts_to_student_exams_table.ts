const studentExams = 'student_exams'
const excludedFromPts = 'is_excluded_from_pts'

exports.up = async knex => addColumn_20210521112217(knex)
exports.down = async knex => dropColumn_20210521112217(knex)

const addColumn_20210521112217 = (knex) => (
  knex.schema.table(studentExams, table => {
    table.boolean(excludedFromPts).defaultTo(false)
  })
)

const dropColumn_20210521112217 = (knex) => (
  knex.schema.table(studentExams, table => {
    table.dropColumn(excludedFromPts)
  })
)
