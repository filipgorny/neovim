const tableName = 'exams'
const columnName = 'review_video_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('videos')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
