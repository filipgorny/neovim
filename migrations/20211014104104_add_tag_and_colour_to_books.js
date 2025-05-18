const tableName = 'books'
const tagColumnName = 'tag'
const tagColourColumnName = 'tag_colour'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(tagColumnName)
    table.string(tagColourColumnName)
  })
)

const down = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(tagColourColumnName)
    table.dropColumn(tagColumnName)
  })
)
