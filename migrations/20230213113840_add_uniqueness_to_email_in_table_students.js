const tableName = 'students'
const columnName = 'email'
const indexName = 'students_email_unique'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName)
  }) 
  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("${columnName}") WHERE "deleted_at" IS NULL`)
}

const down = async knex => {
  await knex.schema.table(tableName, table => {
    table.dropIndex(columnName, indexName)
  }) 
  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("email", "deleted_at") WHERE "deleted_at" IS NULL`)
}
