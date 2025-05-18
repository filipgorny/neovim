const tableName = 'exam_score_map'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable()
    table.smallint('score').notNullable()
    table.integer('student_amount').notNullable()
    table.string('percentile_rank').notNullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
