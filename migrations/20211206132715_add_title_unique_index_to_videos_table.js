const TABLE_NAME = 'videos';
const UNIQUE_COLUMN = 'title';
const INDEX_NAME = 'videos_title_unique'

export async function up(knex) {
    await knex.schema.raw(`CREATE UNIQUE INDEX "${INDEX_NAME}" ON "${TABLE_NAME}" ("${UNIQUE_COLUMN}") WHERE "deleted_at" IS NULL`)
}

export async function down(knex) {
    await knex.schema.raw(`DROP INDEX "${INDEX_NAME}"`)
}

