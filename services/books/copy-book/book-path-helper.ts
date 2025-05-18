import * as R from 'ramda'
import orm from '../../../src/models'

export type BookContentPath = {
  book_content_order: number,
  book_subchapter_order: number,
  book_subchapter_part: number,
  book_chapter_order: number,
}

export type BookSubchapterPath = Omit<BookContentPath, 'book_content_order'>

export type BookChapterPath = {
  book_chapter_order: number,
}

export const findPathByBookContentId = async (bookContentId: string) => {
  const result = await orm.bookshelf.knex.from('book_contents as bc')
    .select(
      orm.bookshelf.knex.raw(
        'bc.id, bc."order" as book_content_order, bs."order" as book_subchapter_order, bs.part as book_subchapter_part, bch."order" as book_chapter_order'
      )
    )
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bch', 'bch.id', 'bs.chapter_id')
    .where({ 'bc.id': bookContentId })

  return R.head(result)
}

export const findBookContentIdByPath = async (bookId: string, path: BookContentPath) => {
  const result = await orm.bookshelf.knex.from('book_contents as bc')
    .select(
      orm.bookshelf.knex.raw(
        'bc.id, bc."order" as book_content_order, bs."order" as book_subchapter_order, bs.part as book_subchapter_part, bch."order" as book_chapter_order'
      )
    )
    .leftJoin('book_subchapters as bs', 'bs.id', 'bc.subchapter_id')
    .leftJoin('book_chapters as bch', 'bch.id', 'bs.chapter_id')
    .where({ 'bch.order': path.book_chapter_order, 'bs.order': path.book_subchapter_order, 'bs.part': path.book_subchapter_part, 'bc.order': path.book_content_order, 'bch.book_id': bookId })

  return R.head(result)
}

export const findPathByBookSubchapterId = async (bookSubchapterId: string) => {
  const result = await orm.bookshelf.knex.from('book_subchapters as bs')
    .select(
      orm.bookshelf.knex.raw(
        'bs.id, bs."order" as book_subchapter_order, bs.part as book_subchapter_part, bch."order" as book_chapter_order'
      )
    )
    .leftJoin('book_chapters as bch', 'bch.id', 'bs.chapter_id')
    .where({ 'bs.id': bookSubchapterId })

  return R.head(result)
}

export const findBookSubchapterIdByPath = async (bookId: string, path: BookSubchapterPath) => {
  const result = await orm.bookshelf.knex.from('book_subchapters as bs')
    .select(
      orm.bookshelf.knex.raw(
        'bs.id, bs."order" as book_subchapter_order, bs.part as book_subchapter_part, bch."order" as book_chapter_order'
      )
    )
    .leftJoin('book_chapters as bch', 'bch.id', 'bs.chapter_id')
    .where({ 'bch.order': path.book_chapter_order, 'bs.order': path.book_subchapter_order, 'bs.part': path.book_subchapter_part, 'bch.book_id': bookId })

  return R.head(result)
}

export const findPathByBookChapterId = async (bookChapterId: string) => {
  const result = await orm.bookshelf.knex.from('book_chapters as bch')
    .select(
      orm.bookshelf.knex.raw(
        'bch.id, bch."order" as book_chapter_order'
      )
    )
    .where({ 'bch.id': bookChapterId })

  return R.head(result)
}

export const findBookChapterIdByPath = async (bookId: string, path: BookChapterPath) => {
  const result = await orm.bookshelf.knex.from('book_chapters as bch')
    .select(
      orm.bookshelf.knex.raw(
        'bch.id, bch."order" as book_chapter_order'
      )
    )
    .where({ 'bch.order': path.book_chapter_order, 'bch.book_id': bookId })

  return R.head(result)
}
