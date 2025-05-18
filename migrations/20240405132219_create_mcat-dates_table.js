const tableName = 'mcat_dates'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('course_id').nullable().index()
    table.date('mcat_date').notNullable()

    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('SET NULL')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
