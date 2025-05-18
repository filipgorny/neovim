import R from 'ramda'
import StudentBookDTO from './dto/student-book-dto'
import orm, { StudentBook } from '../../models'
import { DELETED_AT, _create, _patchCustom, _findOneOrFail, _patch, _delete } from '../../../utils/generics/repository'
import { fetch, fetchRaw } from '../../../utils/model/fetch'
import selectBookAsJson from './query/select-book-as-json'
import selectChaptersAsJson from './query/select-chapters-as-json'
import selectSubchaptersAsjson from './query/select-subchapters-asjson'
import selectContentsAsJson from './query/select-contents-as-json'
import selectResourcesAsJson from './query/select-resources-as-json'
import selectAttachmentsAsJson from './query/select-attachments-as-json'
import selectContentQuestionsAsJson from './query/select-content-questions-as-json'
import selectContentImagesAsJson from './query/select-content-images-as-json'
import selectFlashcardsAsJson from './query/select-flashcards-as-json'
import selectChapterImagesAsJson from './query/select-chapter-images-json'
import { BookContentStatusEnum } from '../student-book-contents/book-content-statuses'
import { StudentCourse } from '../../types/student-course'
import selectOriginalBookAsJson from './query/select-original-book-as-json'
import selectTopicsAsJson from './query/select-topics-as-json'
import selectBookContentCommentsAsJson from './query/select-book-content-comments-as-json'
import selectOriginalContentQuestionsAsJson from './query/select-original-content-questions-as-json'

const { knex } = orm.bookshelf

const MODEL = StudentBook
const MODEL_NAME = 'StudentBook'

export const find = async (query: { limit: { take: number, page: number }, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const create = async (dto: StudentBookDTO) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const patch = async (id: string, data: Partial<StudentBookDTO>) => (
  _patch(MODEL)(id, data)
)

export const patchCustom = (qb: any) => async (data: object) => (
  _patchCustom(qb)(data)
)

export const findOneOrFail = async (where: {}, withRelated: string[]) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const fetchStudentBooks = (student_id: string, student_course_id?: string, isFreeTrial = false) => async (query: { limit: {}, order: {}}) => (
  fetch(MODEL)({
    student_id,
    ...student_course_id && {
      course_id: student_course_id,
    },
    [DELETED_AT]: null,
  }, ['chapters.bookmark.subchapter', 'book'], query)
)

export const fetchStudentBooksSimple = async (student_id: string, student_course_id?: string) => (
  fetch(MODEL)({
    student_id,
    ...student_course_id && {
      course_id: student_course_id,
      is_test_bundle: false,
    },
    [DELETED_AT]: null,
  }, [])
)

export const fetchExistingBooksCount = (externalCreatedAt: string, bookId: string, studentId: string) => (
  MODEL.where({
    book_id: bookId,
    student_id: studentId,
  }).andWhere('external_created_at', '>=', externalCreatedAt)
    .andWhereRaw('deleted_at IS NULL')
    .count()
)

export const patchWhereExternalIdAndExternalCreatedAt = (externalCreatedAt: string, bookId: string, studentId: string) => async (data: object) => (
  patchCustom(
    MODEL.where({
      book_id: bookId,
      student_id: studentId,
    })// .andWhere('external_created_at', '<', externalCreatedAt)
  )(data)
)

const queryPartialMap = {
  originalBook: selectOriginalBookAsJson,
  book: selectBookAsJson,
  topics: selectTopicsAsJson,
  chapters: selectChaptersAsJson,
  chapterImages: selectChapterImagesAsJson,
  subchapters: selectSubchaptersAsjson,
  contents: selectContentsAsJson,
  resources: selectResourcesAsJson,
  attachments: selectAttachmentsAsJson,
  questions: selectContentQuestionsAsJson,
  images: selectContentImagesAsJson,
  flashcards: selectFlashcardsAsJson,
  comments: selectBookContentCommentsAsJson,
}

const buildQueryForBookContent = (studentId, originalBookId, chapterOrder, part, studentCourse, partial?: string) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('student_books')

  if (partial && queryPartialMap[partial]) {
    qb.select(
      queryPartialMap[partial](studentId, originalBookId, chapterOrder, part, studentCourse)(knex)
    )
  } else {
    qb.select(
      selectOriginalBookAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectBookAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectTopicsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectChaptersAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectChapterImagesAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectSubchaptersAsjson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectContentsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectResourcesAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectAttachmentsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectContentQuestionsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectOriginalContentQuestionsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectContentImagesAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectFlashcardsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex),
      selectBookContentCommentsAsJson(studentId, originalBookId, chapterOrder, part, studentCourse)(knex)
    )
  }

  qb.limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (count) {
    return [1]
  }

  return qb
}

const buildFetchQuery = (studentId, originalBookId, studentCourse) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('student_books')
    .select('*')
    .where('student_id', studentId)
    .andWhere('book_id', originalBookId)
    .andWhere('course_id', studentCourse.id)
    .orderBy('created_at', 'desc')
    .limit(1)
    .offset(0)

  return qb
}

export const fetchStudentBookWithPageContents = async (studentId, originalBookId, chapterOrder, part, studentCourse, partial?: string) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildQueryForBookContent(studentId, originalBookId, chapterOrder, part, studentCourse, partial)
  )({
    limit: {
      take: '1',
      page: '1',
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

export const fetchStudentBook = async (studentId, originalBookId, studentCourse: StudentCourse) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildFetchQuery(studentId, originalBookId, studentCourse)
  )({
    limit: {
      take: '1',
      page: '1',
    },
    order: {},
  }),
  R.prop('data'),
  R.head,
])(true)

const buildBookProgressQuery = (studentId: string, studentCourseId: string, onlyFreeTrial = false) => async knex => {
  const qb = knex.from('student_courses AS sc')
    .select(knex.raw(
      'count(distinct sbc2.id) filter (where sbc2.content_status = \'' + BookContentStatusEnum.seen + '\') as seen_count,' +
      'count(distinct sbc2.id) as total_count,' +
      'sb.id AS student_book_id,' +
      'sb.title,' +
      'sc.id,' +
      'sb.book_id AS original_book_id,' +
      'sb.tag AS book_tag,' +
      'sb.last_chapter,' +
      'sb.last_part, ' +
      'sb.last_student_book_subchapter_id_seen'
    ))
    .leftJoin('student_books AS sb', 'sb.course_id', 'sc.id')
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .where('sc.id', studentCourseId)
    .andWhere('sc.student_id', studentId)
    .andWhere('sb.is_test_bundle', false)
    .groupBy('sb.id', 'sc.id')

  return onlyFreeTrial ? qb.andWhere('sb.is_free_trial', true) : qb
}

const buildBookProgressQueryAllCourses = (studentId: string) => async knex => (
  knex.from('student_books AS sb')
    .select(knex.raw(
      'count(distinct sbc2.id) filter (where sbc2.content_status = \'' + BookContentStatusEnum.seen + '\') as seen_count,' +
      'count(distinct sbc2.id) as total_count,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = true) as correct,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct  = false) as incorrect,' +
      'count(distinct sbcq.id) filter (where sbcq.is_correct is null) as untried,' +
      'sc.subtitle,' +
      'sc.title as course_title,' +
      'sc.id as student_course_id,' +
      'sb.id AS student_book_id,' +
      'sb.title,' +
      'sb.book_id AS original_book_id,' +
      'sb.tag AS book_tag,' +
      'sb.last_chapter,' +
      'sb.student_id,' +
      'sb.created_at,' +
      'sb.deleted_at,' +
      'sb.tag,' +
      'sb.tag_colour,' +
      'sb.image_url,' +
      'sbac.seconds,' +
      'sb.last_part'
    ))
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_questions AS sbcq', 'sbcq.content_id', 'sbc2.id')
    .leftJoin('student_book_activity_timers AS sbac', 'sbac.student_book_id', 'sb.id')
    .leftJoin('student_courses AS sc', 'sc.id', 'sb.course_id')
    .andWhere('sb.student_id', studentId)
    .andWhere({ 'sc.is_deleted': false })
    .groupBy('sb.id', 'sbac.seconds', 'sc.subtitle', 'sc.id')
    .orderBy('sb.title', 'asc')
)

export const fetchBookProgressAllCourses = (studentId: string) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildBookProgressQueryAllCourses(studentId)
  )({
    limit: undefined,
    order: {},
  }),
])(true)

export const fetchBookProgressByCourse = async (studentId: string, studentCourseId: string, onlyFreeTrial = false) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildBookProgressQuery(studentId, studentCourseId, onlyFreeTrial)
  )({
    limit: undefined,
    order: {},
  }),
  R.prop('data'),
])(true)

export const findExamsByBookChapters = async (id: string, student_id: string, student_course_id?: string): Promise<any> => {
  if (student_course_id) {
    return knex.from('student_book_chapters AS sbc')
      .select(knex.raw(
        'sbc.id, sbc.order, sbc.title, se.status, se.id as student_exam_id, se.is_free_trial as is_available, se.title as exam_title, se.max_completions, se.completions_done'
      ))
      .leftJoin('student_attached_exams AS sae', 'sae.original_attached_id', 'sbc.original_chapter_id')
      .leftJoin('student_exams AS se', 'se.id', 'sae.exam_id')
      .where('sbc.book_id', id)
      .andWhere('se.student_id', student_id)
      .andWhere('sae.course_id', student_course_id)
  } else {
    return knex.from('student_book_chapters AS sbc')
      .select(knex.raw(
        'sbc.id, sbc.order, sbc.title, se.status, se.id as student_exam_id, se.is_free_trial as is_available, se.title as exam_title, se.max_completions, se.completions_done'
      ))
      .leftJoin('student_attached_exams AS sae', 'sae.original_attached_id', 'sbc.original_chapter_id')
      .leftJoin('student_exams AS se', 'se.id', 'sae.exam_id')
      .where('sbc.book_id', id)
      .andWhere('se.student_id', student_id)
  }
}

export const deleteBookById = async (id: string) => (
  _delete(MODEL)({ id })
)

const buildSearchForPhraseInBook = (studentBookId: string, search: string) => async knex => (
  knex.from('student_books AS sb')
    .select(
      knex.raw(
        'sbc2.id as student_book_content_id,' +
        'sbc2.raw as content_raw,' +
        'sb.book_id original_book_id,' +
        'sbc."order" as chapter_order,' +
        'sbs.part,' +
        'sbs."order" as subchapter_order,' +
        'sbs.id as student_subchapter_id,' +
        'sbcr.raw as resource_raw,' +
        'sbc.order * 100 + sbs.order as order_combined'
      ),
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
              where bcc.id = sbc.id
              and bs.id = sbs.id
              and bo.student_id = sb.student_id
              order by book_id asc, chapter_order asc, subchapter_order asc
          ) as tags
        )::text as tag
      `)
    )
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_resources AS sbcr', 'sbcr.content_id', 'sbc2.id')
    .where('sb.id', studentBookId)
    .andWhereRaw(`(
      sbc2.raw ilike '%${search}%'
      or sbcr.raw ilike '%${search}%'
    )`)
    .orderByRaw('order_combined asc')
)

export const searchForPhraseInBook = (studentBookId: string, search: string) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildSearchForPhraseInBook(studentBookId, search)
  )({
    limit: undefined,
    order: {},
  }),
])(true)

export const getListOfBookIdsByCourseId = async (course_id: string): Promise<string[]> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sb: 'student_books' })
      .where({ course_id }),
    R.pluck('id'),
  ])(true)
)
