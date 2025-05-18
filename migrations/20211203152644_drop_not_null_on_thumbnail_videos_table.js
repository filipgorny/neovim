const tableName = 'videos'
const viewName = 'videos_list_view'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const videosListViewDefinition = knex => 
knex.select(
  'v.*',
  knex.raw('b.id as book_id'),
  knex.raw('b.title as book_title'),
  knex.raw('bcc.id as chapter_id'),
  knex.raw('bcc."order" as chapter_order'),
  'bs.part',
  knex.raw('bs.id as subchapter_id'),
  knex.raw('bs."order" as subchapter_order'),
  knex.raw('bs.title as subchapter_title'),
  knex.raw('bc.id as content_id'),
  knex.raw('bc."order" as content_order'),
  knex.raw('bcr."type" as resource_type'),
  knex.raw('bcr."order" as resource_order'),
).from('videos AS v')
  .leftJoin('book_content_resources as bcr', 'bcr.external_id', 'v.id')
  .leftJoin('book_contents as bc', 'bcr.content_id', 'bc.id')
  .leftJoin('book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
  .leftJoin('book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
  .leftJoin('books as b', 'bcc.book_id', 'b.id')
  .whereRaw('v.deleted_at is null')
  .distinctOn('v.id')

const addColumn = async (knex) => {
  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)
  await knex.schema.table(tableName, table => {
    table.string('thumbnail').nullable().alter()
  })

  await knex.raw(`CREATE VIEW ${viewName} AS ${videosListViewDefinition(knex)}`)
}

const dropColumn = async (knex) => {
  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)
  await knex.schema.table(tableName, table => {
    table.string('thumbnail').nullable().alter()
  })

  await knex.raw(`CREATE VIEW ${viewName} AS ${videosListViewDefinition(knex)}`)
}