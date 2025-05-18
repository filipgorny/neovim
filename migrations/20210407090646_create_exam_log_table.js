const tableName = 'exam_logs'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('exam_id').notNullable().index()
    table.uuid('admin_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.string('type')
    table.text('content')

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')

    table
      .foreign('admin_id')
      .references('id')
      .inTable('admins')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
