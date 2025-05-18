const tableName = 'student_exam_questions'
const columnName = 'student_passage_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.uuid(columnName).index().alter()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName)
  })
)
