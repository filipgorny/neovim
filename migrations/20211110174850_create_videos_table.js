const tableName = 'videos'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.string('description').notNullable()
    table.string('source').notNullable()
    table.string('thumbnail').notNullable()
    table.integer('duration')
    table.timestamp('deleted_at')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
