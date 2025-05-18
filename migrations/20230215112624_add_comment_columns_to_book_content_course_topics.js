const tableName = 'book_content_course_topics'
const commentHtmlColumnName = 'comment_html'
const commentRawColumnName = 'comment_raw'
const commentDeltaObjectColumnName = 'comment_delta_object'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.text(commentHtmlColumnName)
    table.text(commentRawColumnName)
    table.text(commentDeltaObjectColumnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(commentHtmlColumnName)
    table.dropColumn(commentRawColumnName)
    table.dropColumn(commentDeltaObjectColumnName)
  })
)
