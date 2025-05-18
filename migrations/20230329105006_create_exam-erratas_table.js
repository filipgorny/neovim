const tableName = 'exam_erratas'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable()
    table.text('content_delta_object').notNullable()
    table.text('content_raw').notNullable()
    table.text('content_html').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.uuid('created_by').notNullable()

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE')

    table
      .foreign('created_by')
      .references('id')
      .inTable('admins')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
