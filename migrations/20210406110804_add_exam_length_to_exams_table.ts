const examTable = 'exams'
const examLengthColumn = 'exam_length'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(examTable, table => {
    table.json(examLengthColumn)
  })
)

const dropColumns = knex => (
  knex.schema.table(examTable, table => {
    table.dropColumn(examLengthColumn)
  })
)
