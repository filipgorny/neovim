const tableName = 'courses'
const indexName = `external_id_unique_idx`
const columnName = 'external_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async (knex) => {
  await knex.schema.table(tableName, table => {
    table.dropUnique(columnName)
  })
  await knex.raw(`CREATE UNIQUE INDEX ${indexName} ON ${tableName} (${columnName}) WHERE "deleted_at" IS NULL;`)
}

const down = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName)
    table.unique(columnName)
  })
)

