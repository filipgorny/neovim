import BookDTO from './dto/book-dto'
import orm, { Book } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _patchAll,
  _findOne,
  _findOneOrFail,
  DELETED_AT,
  _findOneOrFailWithoutDeleted,
  _delete
} from '../../../utils/generics/repository'
import R from 'ramda'
import selectBookAsJson from './query/select-book-as-json'
import selectChaptersAsJson from './query/select-chapters-as-json'
import selectAttachmentsAsJson from './query/select-attachments-as-json'
import selectContentImagesAsJson from './query/select-content-images-as-json'
import selectContentQuestionsAsJson from './query/select-content-questions-as-json'
import selectContentsAsJson from './query/select-contents-as-json'
import selectFlashcardsAsJson from './query/select-flashcards-as-json'
import selectResourcesAsJson from './query/select-resources-as-json'
import selectSubchaptersAsjson from './query/select-subchapters-as-json'
import selectChapterImagesAsjson from './query/select-chapter-images-json'
import selectTopicsAsjson from './query/select-topics-as-json'
import selectBookContentCommentsAsJson from './query/select-book-content-comments-as-json'
import { AdminRoleEnum } from '../admins/admin-roles'
import moment from 'moment'
import { DATETIME_DATABASE_FORMAT } from '../../constants'
import mapP from '../../../utils/function/mapp'
import { setFlashcardCode } from '../flashcards/flashcard-repository'

const { knex } = orm.bookshelf

const MODEL = Book
const MODEL_NAME = 'Book'

export const create = async (dto: BookDTO) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const update = async (id: string, dto: Partial<BookDTO>) => (
  _patch(MODEL)(id, dto)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const findOne = async (where: object, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const deleteRecordCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneOrFailWithDeleted = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number } | {}, order: { by: string, dir: string } }, where = {}, withRelated = [], disablePagination = false) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query, disablePagination)
)

export const findDeleted = async (query: { limit: { page: number, take: number } | {}, order: { by: string, dir: string } }, withRelated = [], disablePagination = false) => (
  fetch(MODEL)(function () {
    this.whereNotNull(DELETED_AT)
  }, withRelated, query, disablePagination)
)

export const findBookForSync = async (bookId: string, key = 'external_id'): Promise<any> => {
  const book = await find({
    limit: { page: 1, take: 1 },
    order: { by: 'created_at', dir: 'desc' },
  }, { [key]: bookId }, [
    'chapters.subchapters.contents.resources',
    'chapters.subchapters.contents.questions.question',
    'chapters.subchapters.contents.images',
    'chapters.subchapters.contents.flashcards',
    'chapters.subchapters.contents.attachments',
    'chapters.images',
  ])

  return R.pipe(
    R.prop('data'),
    R.invoker(0, 'toJSON'),
    R.head
  )(book)
}

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const findBooks = async (query, filter) => {
  const { search, ...where } = filter || {}
  const qb = search ? MODEL.whereRaw('(title ilike \'%\' || ? || \'%\')', search) : MODEL

  return findCustom(
    where ? qb.where(where).whereNull('deleted_at') : qb
  )(query.limit, query.order, ['chapters.attached.exam', 'attached.exam'])
}

export const findDeletedBooks = async (query, filter) => {
  const { search, ...where } = filter || {}
  const qb = search ? MODEL.whereRaw('(title ilike \'%\' || ? || \'%\')', search) : MODEL

  return findCustom(
    where ? qb.where(where).whereNotNull('deleted_at') : qb.whereNotNull('deleted_at')
  )(query.limit, query.order, ['chapters.attached.exam', 'attached.exam'])
}

const isEmployee = user => user.get('admin_role') === AdminRoleEnum.employee

const findBooksForEmployerRaw = (user, search) => async (knex, pagination, order, countTotal = false) => {
  const qb = knex.from({ b: 'books' })
    .select('b.*')
    .leftJoin({ ba: 'book_admins' }, 'ba.book_id', 'b.id')
    .leftJoin({ a: 'admins' }, 'a.id', 'ba.admin_id')
    .where('ba.admin_id', user.id)
    .whereNull('b.deleted_at')
    .groupBy('b.id')
    .orderBy(order.by, order.dir)
    // .debug(true)

  const builder = search ? qb.whereRaw('(b.title ilike \'%\' || ? || \'%\')', search) : qb

  return countTotal
    ? builder.count()
    : builder.limit(pagination.take).offset(pagination.take * (pagination.page - 1))
}

const findDeletedBooksForEmployerRaw = (user, search) => async (knex, pagination, order, countTotal = false) => {
  const qb = knex.from({ b: 'books' })
    .select('b.*')
    .leftJoin({ ba: 'book_admins' }, 'ba.book_id', 'b.id')
    .leftJoin({ a: 'admins' }, 'a.id', 'ba.admin_id')
    .where('ba.admin_id', user.id)
    .whereNotNull('b.deleted_at')
    .groupBy('b.id')
    .orderBy(order.by, order.dir)
    // .debug(true)

  const builder = search ? qb.whereRaw('(b.title ilike \'%\' || ? || \'%\')', search) : qb

  return countTotal
    ? builder.count()
    : builder.limit(pagination.take).offset(pagination.take * (pagination.page - 1))
}

const findBooksForEmployer = async (user, query, filter) => {
  const { search, ...where } = filter || {}

  return fetchRaw(
    MODEL,
    findBooksForEmployerRaw(user, search)
  )({
    limit: query.limit,
    order: query.order,
  })
}

const findDeletedBooksForEmployer = async (user, query, filter) => {
  const { search, ...where } = filter || {}

  return fetchRaw(
    MODEL,
    findDeletedBooksForEmployerRaw(user, search)
  )({
    limit: query.limit,
    order: query.order,
  })
}

export const findBooksByAdmin = async (user, query, filter) => (
  isEmployee(user) ? findBooksForEmployer(user, query, filter) : findBooks(query, filter)
)

export const findDeletedBooksByAdmin = async (user, query, filter) => (
  isEmployee(user) ? findDeletedBooksForEmployer(user, query, filter) : findDeletedBooks(query, filter)
)

const queryPartialMap = {
  book: selectBookAsJson,
  topics: selectTopicsAsjson,
  chapters: selectChaptersAsJson,
  chapterImages: selectChapterImagesAsjson,
  subchapters: selectSubchaptersAsjson,
  contents: selectContentsAsJson,
  resources: selectResourcesAsJson,
  attachments: selectAttachmentsAsJson,
  questions: selectContentQuestionsAsJson,
  images: selectContentImagesAsJson,
  flashcards: selectFlashcardsAsJson,
  comments: selectBookContentCommentsAsJson,
}

const buildQueryForBookContent = (bookId, chapterOrder, part, partial?: string | string[]) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('books')

  if (partial && Array.isArray(partial) && partial.reduce((a, p) => a && !!queryPartialMap[p], true)) {
    qb.select(
      ...partial.map(p => queryPartialMap[p](bookId, chapterOrder, part)(knex))
    )
  } else if (partial && !Array.isArray(partial) && queryPartialMap[partial]) {
    qb.select(
      queryPartialMap[partial](bookId, chapterOrder, part)(knex)
    )
  } else {
    qb.select(
      selectBookAsJson(bookId)(knex),
      selectTopicsAsjson(bookId, chapterOrder, part)(knex),
      selectChaptersAsJson(bookId)(knex),
      selectChapterImagesAsjson(bookId, chapterOrder)(knex),
      selectSubchaptersAsjson(bookId)(knex),
      selectContentsAsJson(bookId, chapterOrder, part)(knex),
      selectResourcesAsJson(bookId, chapterOrder, part)(knex),
      selectAttachmentsAsJson(bookId, chapterOrder, part)(knex),
      selectContentQuestionsAsJson(bookId, chapterOrder, part)(knex),
      selectContentImagesAsJson(bookId, chapterOrder, part)(knex),
      selectBookContentCommentsAsJson(bookId, chapterOrder, part)(knex),
      selectFlashcardsAsJson(bookId, chapterOrder, part)(knex)
    )
  }

  qb.limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (count) {
    return [1]
  }

  return qb
}

export const fetchBookWithPageContents = async (bookId, chapterOrder, part, partial?: string | string[]) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildQueryForBookContent(bookId, chapterOrder, part, partial)
  )({
    limit: {
      take: 1,
      page: 1,
    },
    order: {},
  }),
  R.prop('data'),
  R.head,
  R.map(
    R.ifElse(
      R.isNil,
      R.always([]),
      R.reject(
        R.pipe(
          R.prop('id'),
          R.isNil
        )
      )
    )
  ),
  R.when(
    R.has('book'),
    R.over(
      R.lensProp('book'),
      R.head
    )
  ),
])(true)

export const findBooksWithIds = async (column: string, values: string[]) => (
  MODEL.whereIn(column, values).fetchAll()
)

export const remove = async (id: string, title: string) => (
  _patch(MODEL)(id, {
    title,
    [DELETED_AT]: new Date(),
  })
)

export const restore = async (id: string) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: null,
  })
)

const OLDNESS_OF_BOOKS_IN_DAYS = 90

const fromOldArchivedOrSoftDeletedUnlockedBooks = () => (
  knex.from({ b: 'books' })
    .where('b.created_at', '<', moment().subtract(OLDNESS_OF_BOOKS_IN_DAYS, 'days').format(DATETIME_DATABASE_FORMAT))
    .andWhere('b.is_locked', false)
    .andWhereRaw('(b.is_archived = true or b.deleted_at is not null)')
)

export const getBookIdsOfOldArchivedOrSoftDeletedUnlockedBooks = async (amount: number) => (
  fromOldArchivedOrSoftDeletedUnlockedBooks()
    .select('b.id')
    .limit(amount)
)

export const countOldArchivedOrSoftDeletedUnlockedBooks = async () => (
  fromOldArchivedOrSoftDeletedUnlockedBooks()
    .count('b.id')
)

export const getFlashcardsIdsInChronologicalOrder = async (id: string) => (
  knex
    .select('f.id')
    .from('book_chapters as bch')
    .leftJoin('book_subchapters as bs', 'bs.chapter_id', 'bch.id')
    .leftJoin('book_contents as bc', 'bc.subchapter_id', 'bs.id')
    .leftJoin('book_content_flashcards as bcf', 'bcf.content_id', 'bc.id')
    .leftJoin('flashcards as f', 'bcf.flashcard_id', 'f.id')
    .where({ book_id: id })
    .whereNotNull('f.id')
    .orderByRaw('bch.order asc, bs.order asc, bc.order asc, f.id asc')
)

export const renumberFlashcards = async (book_id: string, startNumber: number) => {
  const RECORDS_PER_BATCH = 100
  const flashcardIds = await getFlashcardsIdsInChronologicalOrder(book_id)

  for (let i = 0; i < flashcardIds.length; i += RECORDS_PER_BATCH) {
    await R.addIndex(mapP)(
      async ({ id }, j: number) => (
        setFlashcardCode(id, i + j + startNumber)
      )
    )(R.slice(i, i + RECORDS_PER_BATCH, flashcardIds))
  }
}

export const getSoftDeletedChapterIds = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => knex.select('id').from('book_chapters').where({ book_id: id }).whereNotNull(DELETED_AT),
    R.pluck('id'),
  ])
)
