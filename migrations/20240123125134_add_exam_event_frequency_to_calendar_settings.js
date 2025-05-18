const tableName = 'calendar_settings'
const fullLengthColumnName = 'full_length_exam_frequency'
const sectionColumnName = 'section_exam_frequency'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(fullLengthColumnName).nullable()
    table.string(sectionColumnName).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(fullLengthColumnName)
    table.dropColumn(sectionColumnName)
  })
)
