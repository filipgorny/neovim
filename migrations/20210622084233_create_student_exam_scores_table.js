const tableName = 'student_exam_scores'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = (knex) => (
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_type_id').notNullable()
    table.uuid('exam_layout_id').notNullable()
    table.text('scores').notNullable()
    table.uuid('student_id').notNullable()
    table.boolean('is_ts_attached_to_pts').defaultTo(true)
    table.unique(['student_id', 'exam_type_id', 'exam_layout_id'])

    table
      .foreign('exam_type_id')
      .references('id')
      .inTable('exam_types')

    table
      .foreign('exam_layout_id')
      .references('id')
      .inTable('layouts')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })
)

const down = (knex) => knex.schema.dropTable(tableName)
