const tableName = 'student_course_topics'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.string('topic').notNullable()
    table.integer('order')
    table.integer('level')
    table.boolean('is_mastered').defaultTo(false)

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
