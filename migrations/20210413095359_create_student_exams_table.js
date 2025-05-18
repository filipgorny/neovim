const tableName = 'student_exams'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('layout_id').notNullable()
    table.uuid('student_id').notNullable().index()
    table.uuid('exam_id').notNullable()
    table.string('external_id').index()
    table.string('title')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('accessible_from')
    table.timestamp('accessible_to')
    table.boolean('is_active').defaultTo(true)
    table.json('exam_length')
    table.integer('access_period').index()

    table
      .foreign('layout_id')
      .references('id')
      .inTable('layouts')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
