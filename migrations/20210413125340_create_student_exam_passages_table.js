const tableName = 'student_exam_passages'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_section_id').notNullable()
    table.text('content').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('student_section_id')
      .references('id')
      .inTable('student_exam_sections')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
