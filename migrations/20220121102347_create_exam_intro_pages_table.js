const tableName = 'exam_intro_pages'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.integer('order').notNullable()
    table.text('raw').nullable()
    table.text('delta_object').notNullable()
    table.uuid('exam_type_id').notNullable()

    table
      .foreign('exam_type_id')
      .references('id')
      .inTable('exam_types')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
