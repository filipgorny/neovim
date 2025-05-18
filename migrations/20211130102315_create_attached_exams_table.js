const tableName = 'attached_exams'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('attached_id').notNullable().index()
    table.uuid('exam_id').notNullable()
    table.string('type').notNullable()

    table
    .foreign('exam_id')
    .references('id')
    .inTable('exams')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
