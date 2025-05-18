const tableName = 'exam_passages'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('section_id').notNullable()
    table.text('content').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('section_id')
      .references('id')
      .inTable('exam_sections')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
