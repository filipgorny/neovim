const studentExamsTable = 'student_exams'
const examLength = 'exam_length'

exports.up = async knex => jsonToText(knex)
exports.down = async knex => textToJson(knex)

const jsonToText = knex => (
  knex.schema.alterTable(studentExamsTable, table => {
    table.text(examLength).alter()
  })
)

const textToJson = knex => (
  knex.schema.alterTable(studentExamsTable, table => {
    table.json(examLength).alter()
  })
)
