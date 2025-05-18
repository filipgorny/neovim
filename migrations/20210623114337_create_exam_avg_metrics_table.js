const tableName = 'exam_metrics_avg'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_type_id').notNullable()
    table.integer('section_order').notNullable()
    table.text('timings').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
