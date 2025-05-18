const tableName = 'videos'
const columnName = 'title'
const indexName = 'videos_title_unique'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName);
  }) 
)

const down = async knex => (
  knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("${columnName}") WHERE "deleted_at" IS NULL`)
)
