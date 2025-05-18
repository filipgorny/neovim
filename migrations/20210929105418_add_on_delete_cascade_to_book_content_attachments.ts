const tableName_20210929105418_BookContentAttachmentens = 'book_content_attachments'

exports.up = async knex => up_20210929105418(knex)
exports.down = async knex => down_20210929105418(knex)

const up_20210929105418 = knex =>
  knex.schema.table(tableName_20210929105418_BookContentAttachmentens, table => {
    table.dropForeign('content_id')

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
    .onDelete('CASCADE')
  })

const down_20210929105418 = knex => 
  knex.schema.table(tableName_20210929105418_BookContentAttachmentens, table => {
    table.dropForeign('content_id')

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
  })
