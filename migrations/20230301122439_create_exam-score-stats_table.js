const tableName = 'exam_score_stats'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable()
    table.smallint('score').notNullable()
    table.integer('student_count').notNullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
  })
  await knex.raw(`CREATE UNIQUE INDEX exam_score_stats_exam_id_score_unique_idx ON ${tableName} (exam_id, score);`)
}

const dropTable = knex => knex.schema.dropTable(tableName)
