const tableName = 'group_tutoring_days'
const classDateColumnName = 'class_date'
const classTopicColumnName = 'class_topic'
const classNumberColumnName = 'class_topic_number'
const meetingUrlColumnName = 'meeting_url'
const weekdayColumnName = 'weekday'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.date(classDateColumnName).nullable()
    table.string(classTopicColumnName).nullable()
    table.string(classNumberColumnName).nullable()
    table.string(meetingUrlColumnName).nullable()

    table.dropColumn(weekdayColumnName)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(classDateColumnName)
    table.dropColumn(classTopicColumnName)
    table.dropColumn(classNumberColumnName)
    table.dropColumn(meetingUrlColumnName)

    table.string(weekdayColumnName).nullable()
  })
)
