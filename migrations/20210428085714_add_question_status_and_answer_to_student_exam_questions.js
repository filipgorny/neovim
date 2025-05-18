const tableName = 'student_exam_questions'
const columnNameStatus = 'question_status'
const columnNameAnswer = 'answer'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(columnNameStatus).defaultTo('unseen')
    table.string(columnNameAnswer)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameStatus)
    table.dropColumn(columnNameAnswer)
  })
)
