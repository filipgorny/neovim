exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const viewName = 'student_videos_list_view'

const up = (knex) => {
  const videosListViewDefinition = knex
  .select(
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
    'bcr.delta_object',
    'b.student_id',
  ).from('videos AS v')
    .leftJoin('student_book_content_resources as bcr', 'bcr.external_id', 'v.id')
    .leftJoin('student_book_contents as bc', 'bcr.content_id', 'bc.id')
    .leftJoin('student_book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('student_book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('student_books as b', 'bcc.book_id', 'b.id')
    .whereRaw('v.deleted_at is null')
    .distinctOn('v.id')

  return knex.raw(`CREATE VIEW ${viewName} AS ${videosListViewDefinition}`)
}

const down = (knex) => (
  knex.raw(`DROP VIEW IF EXISTS ${viewName}`)
)
