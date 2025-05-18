const tableName = 'group_tutoring_days'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('weekday').notNullable()
    table.string('class_time').notNullable()
    table.string('class_time_end').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
