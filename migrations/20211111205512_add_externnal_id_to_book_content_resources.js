const tableName = 'book_content_resources'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.raw(`alter table ${tableName} alter column raw drop not null`)
  await knex.schema.table(tableName, table => {
    table.uuid('external_id')
  })
}
  

const down = async knex => {
  await knex.raw(`alter table ${tableName} alter column raw drop not null`)
  await knex.schema.table(tableName, table => {
    table.dropColumn('external_id')
  })
}
  
