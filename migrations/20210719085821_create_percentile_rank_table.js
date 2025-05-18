const tableName = 'percentile_rank'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_type_id').notNullable().index()
    table.integer('section_order').notNullable()
    table.integer('correct_answer_amount').notNullable()
    table.decimal('percentile_rank').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('exam_type_id')
      .references('id')
      .inTable('exam_types')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
