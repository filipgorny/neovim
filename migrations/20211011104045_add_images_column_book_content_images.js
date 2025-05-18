const tableName = 'book_content_images'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('url', 'image')
    table.string('small_ver')
  })

const down = knex => 
  knex.schema.alterTable(tableName, table => {
    table.renameColumn('image', 'url')
    table.dropColumn('small_ver')  
  })
