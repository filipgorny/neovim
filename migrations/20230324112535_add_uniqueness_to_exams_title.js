const tableName = 'exams'
const columnName = 'title'
const indexName = 'exams_title_unique'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("${columnName}") WHERE "deleted_at" IS NULL`)
}

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName)
  })
)
