const tableName = 'student_exam_sections'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_exam_id').notNullable()
    table.string('title').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('student_exam_id')
      .references('id')
      .inTable('student_exams')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
