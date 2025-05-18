const tableName = 'student_book_content_course_topics'
const commentHtmlColumnName = 'comment_html'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.text(commentHtmlColumnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(commentHtmlColumnName)
  })
)
