const tableName = 'exam_types'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.text('break_definition')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
