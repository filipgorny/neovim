const tableName = 'exam_type_scaled_score_templates'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_type_id').notNullable().index()
    table.uuid('template_id').notNullable().index()
    table.integer('order').notNullable()
    table.unique(['exam_type_id', 'template_id', 'order'])

    table
      .foreign('exam_type_id')
      .references('id')
      .inTable('exam_types')

    table
      .foreign('template_id')
      .references('id')
      .inTable('scaled_score_templates')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
