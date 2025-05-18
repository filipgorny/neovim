const tableName = 'book_chapter_images'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = (knex) => (
  knex.schema.alterTable(tableName, table => {
    table.string('image').nullable().alter()
    table.string('small_ver').nullable().alter()
  })
)

const down = (knex) => (
  knex.schema.alterTable(tableName, table => {
    table.string('image').notNullable().alter()
    table.string('small_ver').notNullable().alter()
  })
)
