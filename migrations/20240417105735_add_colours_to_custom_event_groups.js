const tableName = 'custom_event_groups'
const colourA = 'colour_gradient_start'
const colourB = 'colour_gradient_end'
const colourC = 'colour_font'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(colourA).defaultTo('#e0e0e0').nullable()
    table.string(colourB).defaultTo('#f0f0f0').nullable()
    table.string(colourC).defaultTo('#333333').nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(colourA)
    table.dropColumn(colourB)
    table.dropColumn(colourC)
  })
)
