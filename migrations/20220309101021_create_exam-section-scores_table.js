const tableName = 'exam_section_scores'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('section_id')
    table.integer('score').notNullable()
    table.integer('correct_answers').notNullable()
    table.string('percentile_rank').notNullable()
    table.string('percentage').notNullable()

    table
      .foreign('section_id')
      .references('id')
      .inTable('exam_sections')
  })

const dropTable = knex => knex.schema.dropTable(tableName)

