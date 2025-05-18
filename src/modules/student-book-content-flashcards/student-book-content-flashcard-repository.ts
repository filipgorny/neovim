import R from 'ramda'
import StudentBookContentFlashcardDTO from './dto/student-book-content-flashcard-dto'
import orm, { StudentBookContentFlashcard } from '../../models'
import { _create, _findOneOrFail, _patch, _patchAll, _patchCustom, _patchRaw, _patchWhere, _deleteAllByCustomColumn, _delete } from '../../../utils/generics/repository'
import { fetch, fetchRaw, fetchRawWithoutMeta } from '../../../utils/model/fetch'
import applyFilters from '../../../utils/query/apply-filters'
import allowedFilters from './query/allowed-filters'
import { Knex } from 'knex'
import { FlashcardPLevels } from '../../../services/student-book-content-flashcards/flashcard-p-levels'
import { StudentCourse } from '../../types/student-course'
import { int } from '../../../utils/number/int'
import { flashcardDoesNotBelongToStudentException, throwException } from '../../../utils/error/error-factory'

const MODEL = StudentBookContentFlashcard
const MODEL_NAME = 'StudentBookContentFlashcard'

const knex = orm.bookshelf.knex

export const create = async (dto: StudentBookContentFlashcardDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const patchWhere = async (where: {}, data: {}) => (
  _patchWhere(MODEL)(where, data)
)

export const patchAll = async (ids: string[], data: {}) => (
  _patchAll(MODEL)(ids, data)
)

export const patchCustom = (qb: any) => async (data: object) => (
  _patchCustom(qb)(data)
)

export const deleteById = async (id: string) => (
  _delete(MODEL)({ id })
)

const findFlashcardIds = (where, filter, studentCourse: StudentCourse) => async (knex: Knex) => {
  const qb = knex({ f: 'student_book_content_flashcards' })
    .leftJoin({ bc: 'student_book_contents' }, 'bc.id', 'f.content_id')
    .leftJoin({ bs: 'student_book_subchapters' }, 'bs.id', 'bc.subchapter_id')
    .leftJoin({ bcc: 'student_book_chapters' }, 'bcc.id', 'bs.chapter_id')
    .leftJoin({ b: 'student_books' }, 'b.id', 'bcc.book_id')
    .where(where)
    .andWhere('b.course_id', studentCourse.id)
    .select('f.id', 'f.proficiency_level', 'f.original_flashcard_id')

  applyFilters(allowedFilters)(qb, knex, filter)

  return qb
}

export const flashcardBelongsToStudent = async (student_flashcard_id: string, student_id: string) => (
  R.pipeWith(R.andThen)([
    async () => knex({ f: 'student_book_content_flashcards' })
      .leftJoin({ bc: 'student_book_contents' }, 'bc.id', 'f.content_id')
      .leftJoin({ bs: 'student_book_subchapters' }, 'bs.id', 'bc.subchapter_id')
      .leftJoin({ bcc: 'student_book_chapters' }, 'bcc.id', 'bs.chapter_id')
      .leftJoin({ b: 'student_books' }, 'b.id', 'bcc.book_id')
      .where({ 'f.id': student_flashcard_id, 'b.student_id': student_id }),
    R.head,
    R.when(
      R.isNil,
      () => throwException(flashcardDoesNotBelongToStudentException())
    ),
  ])(true)
)

export const getFlashcardIdsToReset = async (student_id, studentCourse: StudentCourse, filter) => (
  R.pipeWith(R.andThen)([
    async () => fetchRaw(StudentBookContentFlashcard, findFlashcardIds({ student_id }, filter, studentCourse))({}),
    R.prop('data'),
    R.pluck('id'),
  ])(true)
)

export const getFlashcardsToAnswer = async (student_id, original_flashcard_id, studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async () => fetchRaw(StudentBookContentFlashcard, findFlashcardIds({ student_id, original_flashcard_id }, {}, studentCourse))({}),
    R.prop('data'),
    R.head,
  ])(true)
)

const attachPartFilter = (part?) => part ? `where sbss.part = ${part}` : ''
const attachPartFilterWithAnd = (part?) => part ? `and bs.part = ${part}` : ''
const attachCustomBoxId = (id?: string) => id ? `and sbf.student_flashcard_box_id ='${id}'` : ''

const fromBookFlashcards = (studentId: string, studentCourse: StudentCourse, part?: string, fromArchive?: boolean) => (knex, search, filter = {}) => {
  const customBoxId = R.prop('custom_box_id')(filter)

  let qb = knex.from(knex.raw(`(
    select
      distinct on ("fl"."code", "f"."original_flashcard_id", "b"."student_id", "b"."course_id")
      "fl"."code",
      "f"."original_flashcard_id" as "id",
      "f"."id" as "student_flashcard_id",
      "f"."original_flashcard_id",
      "fl"."question",
      "fl"."explanation",
      "fl"."question_image",
      "fl"."explanation_image",
      "fl"."question_html",
      "fl"."explanation_html",
      "f"."proficiency_level",
      "f"."content_id",
      "bc"."subchapter_id",
      "bs"."chapter_id",
      "bcc"."order" as "chapter_order",
      "bcc"."book_id",
      "bs"."part",
      "b"."student_id",
      "b"."course_id",
      "s"."flashcard_study_mode" as "study_mode",
      "f"."study_order",
      "f"."content_id"
    from
      "student_book_content_flashcards" as "f"
    left join "student_book_contents" as "bc" on
      "f"."content_id" = "bc"."id"
    left join "student_book_subchapters" as "bs" on
      "bc"."subchapter_id" = "bs"."id"
    left join "student_book_chapters" as "bcc" on
      "bs"."chapter_id" = "bcc"."id"
    left join "student_books" as "b" on
      "bcc"."book_id" = "b"."id"
    left join "books" as "_b" on
      "b"."book_id" = "_b"."id"
    left join "students" as "s" on
      "b"."student_id" = "s"."id"
    left join "flashcards" as "fl" on
      "f"."original_flashcard_id" = "fl"."id"
      left join student_box_flashcards sbf on (sbf.student_flashcard_id = f.id)
    where 
      "b"."student_id" = '${studentId}'
      and "b"."course_id" = '${studentCourse.id}'
      ${attachCustomBoxId(customBoxId)}
      and "_b"."flashcards_accessible" = true
      and "f"."id" ${fromArchive ? '' : 'not'} in (
        select "student_flashcard_id"
        from "student_flashcard_archive"
        where "student_course_id" = "b"."course_id"
      )
      ${attachPartFilterWithAnd(part)}
    order by "fl"."code"
    ) f`))

  if (part) {
    qb = qb.andWhere('f.part', int(part))
  }

  console.log(`applyFilters ${JSON.stringify(filter)}`)

  const mapFilters = {
    'b.id': 'f.book_id', // book
    'b.tag': 'f.tag', // book tag
    'bcc.id': 'f.chapter_id', // chapter
    'bs.id': 'f.subchapter_id', // subchapter
    'bc.id': 'f.content_id', // content
    'f.proficiency_level': 'f.proficiency_level',
  }
  const newAllowedFilters = [
    'f.book_id', // book
    'f.tag', // book tag
    'f.chapter_id', // chapter
    'f.subchapter_id', // subchapter
    'f.content_id', // content
    'f.proficiency_level',
  ]
  const newFilter = {}
  for (const key of Object.keys(filter)) {
    if (mapFilters[key]) newFilter[mapFilters[key]] = filter[key]
  }

  applyFilters(newAllowedFilters)(qb, knex, newFilter)

  return qb
}

const countResults = (studentId: string, studentCourse: StudentCourse, part?: string, fromArchive?: boolean) => async (knex, search, filter) => (
  fromBookFlashcards(studentId, studentCourse, part, fromArchive)(knex, search, filter)
    .select(
      'f.code'
    )
    .groupByRaw('f.code, f.id, f.student_id, f.course_id')
    .countDistinct('f.code')
)

const buildQuery = (studentId: string, studentCourse: StudentCourse, part?: string, fromArchive?: boolean) => (filter, search, orderByRaw?: string) => async (knex, pagination, order, count = false) => {
  const qb = fromBookFlashcards(studentId, studentCourse, part, fromArchive)(knex, search, filter)
    .select(
      'f.*',
      knex.raw(`
      (
        select json_agg(row_to_json(tags)) from (
            select distinct on (book_id, chapter_order, subchapter_order)
              bo.tag, 
              bo.tag_colour,
              bo.book_id,
              bo.title as book_title,
              bcc.original_chapter_id as chapter_id,
              bcc."order" as chapter_order,
              bs.part,
              bs.original_subchapter_id as subchapter_id,
              bs."order" as subchapter_order,
              bs.title as subchapter_title,
              bc.original_content_id as content_id,
              bc."order" as content_order
            from student_books bo
              left join student_book_chapters bcc on bcc.book_id = bo.id
              left join student_book_subchapters bs on bs.chapter_id = bcc.id 
              left join student_book_contents bc on bc.subchapter_id = bs.id 
              left join student_book_content_flashcards bcf on bcf.content_id = bc.id 
            where bcf.original_flashcard_id = f.id
            and bo.student_id = f.student_id
            ${attachPartFilterWithAnd(part)}
            order by book_id asc, chapter_order asc, subchapter_order asc
        ) as tags
      )::text as tags
    `)
    )
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .distinct('f.code')

  if (count) {
    const count = await countResults(studentId, studentCourse, part, fromArchive)(knex, search, filter)
    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return orderByRaw ? qb.orderByRaw(orderByRaw) : qb
}

const buildQueryWithoutTags = (studentId: string, studentCourse: StudentCourse, part?) => (filter, search, orderByRaw?: string) => async (knex, pagination, order, count = false) => {
  const qb = fromBookFlashcards(studentId, studentCourse, part)(knex, search, filter)
    .select(
      'f.*'
    )
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .distinct('f.id')

  if (count) {
    const count = await countResults(studentId, studentCourse, part)(knex, search, filter)
    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return orderByRaw ? qb.orderByRaw(orderByRaw) : qb
}

const buildStatsQuery = (studentId: string, studentCourse: StudentCourse, part?) => (filter, search) => async (knex, pagination, order, count = false) => (
  fromBookFlashcards(studentId, studentCourse, part)(knex, search, filter)
    .select(
      'f.proficiency_level',
      knex.raw('count(distinct f.id)')
    )
    .groupByRaw('f.proficiency_level')
)

export const fetchPLevelStats = (studentId: string, studentCourse: StudentCourse, part?) => async (filter) => {
  const search = R.propOr('', 'search')(filter)
  const pLevels = R.range(FlashcardPLevels.minLevel, FlashcardPLevels.maxLevel + 1)
  const finalFilter = R.omit(['f.proficiency_level'])(filter)

  const results = await R.pipeWith(R.andThen)([
    fetchRaw(
      MODEL,
      buildStatsQuery(studentId, studentCourse, part)(finalFilter, search)
    ),
    R.prop('data'),
    R.map(R.values),
    R.fromPairs,
    R.mergeAll,
    R.map(Number),
  ])({})

  return R.map(
    value => ({
      proficiency_level: value,
      count: results[value] || 0,
    })
  )(pLevels)
}

export const fetchFlashcardsToStudy = (studentId: string, studentCourse: StudentCourse, part?) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(studentId, studentCourse, part)(filter, search, 'f.study_order asc')
  )(query)
}

export const fetchFlashcardsToStudyOptimized = (studentId: string, studentCourse: StudentCourse, part?) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRawWithoutMeta(
    MODEL,
    buildQueryWithoutTags(studentId, studentCourse, part)(filter, search, 'f.study_order asc')
  )(query)
}

export const findStudentFlashcards = (studentId: string, studentCourse: StudentCourse, part?) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(studentId, studentCourse, part)(filter, search, 'f.code asc')
  )(query)
}

export const findArchivedStudentFlashcards = (studentId: string, studentCourse: StudentCourse, part?) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(studentId, studentCourse, part, true)(filter, search, 'f.code asc')
  )(query)
}

export const reorderFlashcardsToStudy = async (flashcards: Array<{study_order: number, id: string}>) => (
  knex.transaction(
    _patchRaw(knex, 'student_book_content_flashcards')(flashcards)
  )
)

const fromStudentBookContentFlashcards = (knex, studentId, courseId) => (
  knex
    .from('student_books as sb')
    .leftJoin('student_book_chapters as sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents as sbcc', 'sbcc.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_flashcards as sbcf', 'sbcf.content_id', 'sbcc.id')
    .leftJoin('books as b', 'sb.book_id', 'b.id')
    .where('sb.student_id', studentId)
    .where('sb.course_id', courseId)
    .where('b.flashcards_accessible', true)
    .where('sb.is_test_bundle', false)
    .whereRaw('sbcf.id not in (select student_flashcard_id from student_flashcard_archive where student_course_id = sb.course_id)')
)

export const fetchForFlashcardProficiencyGraph = async (studentId: string, courseId: string) => (
  knex.union(
    fromStudentBookContentFlashcards(knex, studentId, courseId)
      .select(
        knex.raw('\'ALL\' as id'),
        knex.raw('\'ALL\' as name'),
        'sbcf.proficiency_level',
        knex.raw('\'00000000-0000-0000-0000-000000000000\' as book_id'),
        knex.raw('count(distinct sbcf.original_flashcard_id)')
      ).groupByRaw('sbcf.proficiency_level')
  ).union(
    fromStudentBookContentFlashcards(knex, studentId, courseId)
      .select(
        knex.raw('sb.id::text'),
        'sb.tag as name',
        'sbcf.proficiency_level',
        'sb.book_id',
        knex.raw('count(distinct sbcf.original_flashcard_id)')
      ).groupByRaw('sbcf.proficiency_level, sb.id, sb.book_id')
  ).orderBy('id')
)

export const fetchForChapterFlashcardProficiencyGraph = async (studentId: string, courseId: string, chapterId: string) => (
  knex
    .from('student_books as sb')
    .leftJoin('student_book_chapters as sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents as sbcc', 'sbcc.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_flashcards as sbcf', 'sbcf.content_id', 'sbcc.id')
    .leftJoin('books as b', 'sb.book_id', 'b.id')
    .where('sb.student_id', studentId)
    .where('sb.course_id', courseId)
    .where('sbs.chapter_id', chapterId)
    .where('b.flashcards_accessible', true)
    .whereRaw('sbcf.id not in (select student_flashcard_id from student_flashcard_archive where student_course_id = sb.course_id)')
    .select(
      knex.raw('sb.id::text'),
      'sb.tag as name',
      'sbcf.proficiency_level',
      'sb.book_id',
      knex.raw('count(distinct sbcf.original_flashcard_id)')
    ).groupByRaw('sbcf.proficiency_level, sb.id, sb.book_id')
)

export const fetchForCustomBoxFlashcardProficiencyGraph = async (studentId: string, courseId: string, customBoxId: string) => (
  knex
    .from('student_books as sb')
    .leftJoin('student_book_chapters as sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents as sbcc', 'sbcc.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_flashcards as sbcf', 'sbcf.content_id', 'sbcc.id')
    .leftJoin('books as b', 'sb.book_id', 'b.id')
    .leftJoin('student_box_flashcards as sbf', 'sbcf.id', 'sbf.student_flashcard_id')
    .where('sb.student_id', studentId)
    .where('sb.course_id', courseId)
    .where('sbf.student_flashcard_box_id', customBoxId)
    .where('b.flashcards_accessible', true)
    .whereRaw('sbcf.id not in (select student_flashcard_id from student_flashcard_archive where student_course_id = sb.course_id)')
    .select(
      knex.raw('sb.id::text'),
      'sb.tag as name',
      'sbcf.proficiency_level',
      'sb.book_id',
      knex.raw('count(distinct sbcf.original_flashcard_id)')
    ).groupByRaw('sbcf.proficiency_level, sb.id, sb.book_id')
)

export const fetchForBookFlashcardProficiencyGraph = async (studentId: string, courseId: string, bookId: string) => (
  knex
    .from('student_books as sb')
    .leftJoin('student_book_chapters as sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents as sbcc', 'sbcc.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_flashcards as sbcf', 'sbcf.content_id', 'sbcc.id')
    .leftJoin('books as b', 'sb.book_id', 'b.id')
    .where('sb.student_id', studentId)
    .where('sb.course_id', courseId)
    .where('sb.id', bookId)
    .where('b.flashcards_accessible', true)
    .whereRaw('sbcf.id not in (select student_flashcard_id from student_flashcard_archive where student_course_id = sb.course_id)')
    .select(
      knex.raw('sb.id::text'),
      'sb.tag as name',
      'sbcf.proficiency_level',
      'sb.book_id',
      knex.raw('count(distinct sbcf.original_flashcard_id)')
    ).groupByRaw('sbcf.proficiency_level, sb.id, sb.book_id')
)

export const deleteFlashcardsByContentId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('content_id', [content_id])
)

export const countFlashcardsByContentId = async (content_id: string): Promise<number> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ f: 'student_book_content_flashcards' })
      .where({ content_id })
      .countDistinct('f.original_flashcard_id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const countFlashcardsByChapterId = async (chapter_id: string): Promise<number> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sbcf: 'student_book_content_flashcards' })
      .leftJoin('student_book_contents as sbcc', 'sbcc.id', 'sbcf.content_id')
      .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbcc.subchapter_id')
      .where({ chapter_id })
      .countDistinct('sbcf.original_flashcard_id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const countFlashcardsByBookId = async (book_id: string): Promise<number> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sbcf: 'student_book_content_flashcards' })
      .leftJoin('student_book_contents as sbcc', 'sbcc.id', 'sbcf.content_id')
      .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbcc.subchapter_id')
      .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
      .where({ book_id })
      .countDistinct('sbcf.original_flashcard_id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const countFlashcardsByCourseId = async (course_id: string): Promise<number> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sbcf: 'student_book_content_flashcards' })
      .leftJoin('student_book_contents as sbcc', 'sbcc.id', 'sbcf.content_id')
      .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbcc.subchapter_id')
      .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
      .where({ course_id })
      .countDistinct('sbcf.original_flashcard_id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const getCourseBookChapterIdsByFlashcardId = async (student_flashcard_id: string) => (
  R.pipeWith(R.andThen)([
    async () => knex
      .select('chapter_id', 'sbc.book_id', 'course_id')
      .from({ sbcf: 'student_book_content_flashcards' })
      .leftJoin('student_book_contents as sbcc', 'sbcc.id', 'sbcf.content_id')
      .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbcc.subchapter_id')
      .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
      .where({ 'sbcf.id': student_flashcard_id }),
    R.head,
  ])(true)
)
