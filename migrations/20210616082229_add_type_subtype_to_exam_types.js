const tableName = 'exam_types'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = (knex) => (
  knex.schema.table(tableName, table => {
    table.string('type').notNullable().defaultTo('full')
    table.string('subtype').notNullable().defaultTo('mcat')
    table.unique(['type', 'subtype'])
  })
)

const down = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropUnique(['type', 'subtype'])
    table.dropColumn('type')
    table.dropColumn('subtype')
  })
)

