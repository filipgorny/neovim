const tableName = 'students'
const columnName = 'external_id'
const indexName = 'students_external_id_unique'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.table(tableName, table => {
    table.bigInteger(columnName).nullable().defaultTo(null)
  })
  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("${columnName}") WHERE "deleted_at" IS NULL`)
}

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName)
    table.dropColumn(columnName)
  })
)
