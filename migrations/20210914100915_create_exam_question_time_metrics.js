const tableName = 'exam_question_time_metrics'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable().index()
    table.uuid('exam_question_id').notNullable().index()
    table.integer('section_score').notNullable()
    table.integer('checking_sum').nullable()
    table.integer('checking_divisor').nullable()
    table.decimal('checking_avg').nullable()
    table.integer('reading_sum').nullable()
    table.integer('reading_divisor').nullable()
    table.decimal('reading_avg').nullable()
    table.integer('working_sum').nullable()
    table.integer('working_divisor').nullable()
    table.decimal('working_avg').nullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')

    table
      .foreign('exam_question_id')
      .references('id')
      .inTable('exam_questions')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
