const tableName = 'book_content_resources'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.text('raw').notNullable().alter()
  })

const down = knex => 
  knex.schema.alterTable(tableName, table => {
    table.text('raw').nullable().alter()
  })
