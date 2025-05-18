const tableName = 'book_content_images'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.string('image').nullable().alter()
  })

const down = knex => 
  knex.schema.alterTable(tableName, table => {
    table.string('image').nullable().alter()
  })
