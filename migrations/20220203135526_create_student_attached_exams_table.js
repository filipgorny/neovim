const tableName = 'student_attached_exams'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable().index()
    table.uuid('original_attached_id').notNullable().index()
    table.uuid('exam_id').notNullable()
    table.string('type').notNullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('student_exams')
      
    table
      .foreign('course_id')
      .references('id')
      .inTable('student_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
