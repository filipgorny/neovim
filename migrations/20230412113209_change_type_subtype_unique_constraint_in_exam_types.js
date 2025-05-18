const tableName = 'exam_types'
const indexName = `exam_types_type_subtype_unique_idx`

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async (knex) => {
  await knex.schema.table(tableName, table => {
    table.dropUnique(['type', 'subtype'])
  })
  await knex.raw(`CREATE UNIQUE INDEX ${indexName} ON ${tableName} (type, subtype) WHERE "deleted_at" IS NULL;`)
}

const down = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropIndex(['type', 'subtype'], indexName)
    table.unique(['type', 'subtype'])
  })
)

