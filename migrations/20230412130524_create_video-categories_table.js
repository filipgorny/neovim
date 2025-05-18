const tableName = 'video_categories'
const indexName1 = 'video_categories_1_unique'
const indexName2 = 'video_categories_2_unique'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.uuid('course_id').notNullable()
    table.string('course_type').notNullable()
    table.uuid('end_date_id')
    table.boolean('is_hidden').defaultTo(false)

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')

    table
      .foreign('end_date_id')
      .references('id')
      .inTable('course_end_dates')
      .onDelete('CASCADE')
  })

  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName1}" ON "${tableName}" ("title", "course_id", "course_type") WHERE "end_date_id" IS NULL`)
  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName2}" ON "${tableName}" ("title", "course_id", "course_type", "end_date_id") WHERE "end_date_id" IS NOT NULL`)
}

const dropTable = knex => knex.schema.dropTable(tableName)
