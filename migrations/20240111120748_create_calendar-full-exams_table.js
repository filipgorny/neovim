const tableName = 'calendar_full_exams'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').notNullable()
    table.uuid('exam_id').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE')

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
