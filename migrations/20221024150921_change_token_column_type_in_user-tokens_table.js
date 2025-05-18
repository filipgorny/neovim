const tableName = 'user_tokens'


exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.string('token').alter()
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.uuid('token').alter()
  })