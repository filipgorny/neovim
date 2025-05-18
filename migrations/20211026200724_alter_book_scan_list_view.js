const { BookContentTypeEnum } = require('../src/modules/book-contents/book-content-types')
const { BookContentResourceTypeEnum } = require('../src/modules/book-content-resources/book-contennt-resource-types')

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const viewName = 'book_scan_list_view'

const up = async (knex) => {
  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)

  const glossaryScanListViewDefinition = knex
  .union(qb => qb.select(
    'bc.id',
    'bc.raw',
    'bc.delta_object',
    knex.raw('\'book_content\' as "type"'),
    knex.raw('b.title as book_title'),
    knex.raw('b.tag as book_tag'),
    knex.raw('b.tag_colour as book_tag_colour'),
    knex.raw('bcc."order" as chapter_order'),
    'bs.part',
    knex.raw('bs."order" as subchapter_order'),
    knex.raw('bs.title as subchapter_title'),
    knex.raw('bc."order" as content_order'),
    knex.raw('null as resource_order')
  ).from('book_contents as bc')
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bcc', 'bcc.id', 'bs.chapter_id')
    .leftJoin('books as b', 'b.id', 'bcc.book_id')
    .whereNull('bc.deleted_at')
    .whereIn('bc.type', [BookContentTypeEnum.main_text, BookContentTypeEnum.salty_comment])
  ).union(qb => qb.select(
    'bcr.id',
    'bcr.raw',
    'bcr.delta_object',
    knex.raw('\'book_content_resource\' as "type"'),
    knex.raw('b.title as book_title'),
    knex.raw('b.tag as book_tag'),
    knex.raw('b.tag_colour as book_tag_colour'),
    knex.raw('bcc."order" as chapter_order'),
    'bs.part',
    knex.raw('bs."order" as subchapter_order'),
    knex.raw('bs.title as subchapter_title'),
    knex.raw('bc."order" as content_order'),
    knex.raw('bcr."order" as resource_order')
  ).from('book_content_resources as bcr')
    .leftJoin('book_contents as bc', 'bc.id', 'bcr.content_id')
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bcc', 'bcc.id', 'bs.chapter_id')
    .leftJoin('books as b', 'b.id', 'bcc.book_id')
    .whereNull('bc.deleted_at')
    .whereIn('bcr.type', [BookContentResourceTypeEnum.clinical_context, BookContentResourceTypeEnum.mcat_think, BookContentResourceTypeEnum.tmi]))

  return knex.raw(`CREATE VIEW ${viewName} AS ${glossaryScanListViewDefinition}`)
}

const down = async (knex) => {
  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)

  const glossaryScanListViewDefinition = knex
  .union(qb => qb.select(
    'bc.id',
    'bc.raw',
    'bc.delta_object',
    knex.raw('\'book_content\' as "type"'),
    knex.raw('b.title as book_title'),
    knex.raw('bcc."order" as chapter_order'),
    'bs.part',
    knex.raw('bs."order" as subchapter_order'),
    knex.raw('bs.title as subchapter_title'),
    knex.raw('bc."order" as content_order'),
    knex.raw('null as resource_order')
  ).from('book_contents as bc')
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bcc', 'bcc.id', 'bs.chapter_id')
    .leftJoin('books as b', 'b.id', 'bcc.book_id')
    .whereNull('bc.deleted_at')
    .whereIn('bc.type', [BookContentTypeEnum.main_text, BookContentTypeEnum.salty_comment])
  ).union(qb => qb.select(
    'bcr.id',
    'bcr.raw',
    'bcr.delta_object',
    knex.raw('\'book_content_resource\' as "type"'),
    knex.raw('b.title as book_title'),
    knex.raw('bcc."order" as chapter_order'),
    'bs.part',
    knex.raw('bs."order" as subchapter_order'),
    knex.raw('bs.title as subchapter_title'),
    knex.raw('bc."order" as content_order'),
    knex.raw('bcr."order" as resource_order')
  ).from('book_content_resources as bcr')
    .leftJoin('book_contents as bc', 'bc.id', 'bcr.content_id')
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bcc', 'bcc.id', 'bs.chapter_id')
    .leftJoin('books as b', 'b.id', 'bcc.book_id')
    .whereNull('bc.deleted_at')
    .whereIn('bcr.type', [BookContentResourceTypeEnum.clinical_context, BookContentResourceTypeEnum.mcat_think, BookContentResourceTypeEnum.tmi]))

  return knex.raw(`CREATE VIEW ${viewName} AS ${glossaryScanListViewDefinition}`)
}
