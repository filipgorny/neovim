const TABLE_NAME = 'students'
const INDEX_NAME = 'students_email_unique'

exports.up = async (knex) => {
  await knex.schema.table(TABLE_NAME, table => {
        table.dropUnique(['email'])

        table.timestamp('deleted_at').nullable()
  })

  await knex.schema.raw(`CREATE UNIQUE INDEX "${INDEX_NAME}" ON "${TABLE_NAME}" ("email", "deleted_at") WHERE "deleted_at" IS NULL`)
};

exports.down = async (knex) => {
    await knex.raw(`DROP INDEX ${INDEX_NAME}`)

    await knex.schema.table(TABLE_NAME, table => {
        table.dropColumn('deleted_at')
    })
};
