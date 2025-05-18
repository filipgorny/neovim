const tableName = 'exam_section_score_map'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable()
    table.uuid('section_id').notNullable()
    table.smallint('correct_answers').notNullable()
    table.smallint('score').notNullable()
    table.integer('amount_correct').notNullable()
    table.string('percentile_rank').notNullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')

    table
      .foreign('section_id')
      .references('id')
      .inTable('exam_sections')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
