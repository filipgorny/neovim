import StudentBookContentDTO from './dto/student-book-content-dto'
import orm, { StudentBookContent } from '../../models'
import { _create, DELETED_AT, _patchCustom, _delete, _findOneOrFail } from '../../../utils/generics/repository'
import R from 'ramda'
import { fetchRawSimple } from '../../../utils/model/fetch'
import { BookContentStatusEnum } from './book-content-statuses'

const { knex } = orm.bookshelf

interface CheckIfSpecifiedBookContentExistCommand {
  studentId: string;
  contentId: string;
}

interface PatchCommand {
  id: string;
  data: object;
  select?: string[];
}

const MODEL = StudentBookContent
const MODEL_NAME = 'StudentBookContent'

export const create = async (dto: StudentBookContentDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const checkIfSpecifiedBookContentExist = async (command: CheckIfSpecifiedBookContentExistCommand) => {
  const result = await knex({ sbc: 'student_book_contents' })
    .count('sbc.id')
    .where({ 'sbc.id': command.contentId })
    .innerJoin({ sbs: 'student_book_subchapters' }, 'sbs.id', 'sbc.subchapter_id')
    .innerJoin({ sbca: 'student_book_chapters' }, 'sbca.id', 'sbs.chapter_id')
    .innerJoin({ sb: 'student_books' }, join => {
      join.on('sb.id', 'sbca.book_id')
        .andOnIn('sb.student_id', [command.studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .first()

  return Boolean(parseInt(result.count as string, 10))
}

export const patch = async (command: PatchCommand) => {
  const result = await knex('student_book_contents')
    .where({ id: command.id })
    .update(command.data, command.select ?? ['*'])

  return R.head(result)
}

export const patchWhereIn = async (column, where, data) => (
  _patchCustom(MODEL.whereIn(column, where))(data)
)

export const getUnreadContentsInBookCount = async (bookId: string) => {
  const result = await fetchRawSimple({}, qb => {
    return qb.select(knex.raw('count(sb.id)'))
      .from('student_books as sb')
      .leftJoin('student_book_chapters as sbc', 'sb.id', 'sbc.book_id')
      .leftJoin('student_book_subchapters as sbs', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_book_contents as sbc2', 'sbs.id', 'sbc2.subchapter_id')
      .where('sbc2.content_status', BookContentStatusEnum.unseen)
      .andWhere('sb.id', bookId)
  })

  return R.pipe(
    R.head,
    R.prop('count'),
    parseInt
  )(result)
}

export const getUnreadContentsInCourseCount = async book => {
  const result = await fetchRawSimple({}, qb => {
    return qb.select(knex.raw('count(sb.id)'))
      .from('student_books as sb')
      .leftJoin('student_courses as sc', 'sc.book_course_id', 'sb.course_id')
      .leftJoin('student_book_chapters as sbc', 'sb.id', 'sbc.book_id')
      .leftJoin('student_book_subchapters as sbs', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_book_contents as sbc2', 'sbs.id', 'sbc2.subchapter_id')
      .where('sbc2.content_status', BookContentStatusEnum.unseen)
      .andWhere('sb.course_id', book.course_id)
      .andWhere('sb.student_id', book.student_id)
  })

  return R.pipe(
    R.head,
    R.prop('count'),
    parseInt
  )(result)
}

export const getUnreadContentsInCourseCountByStudentCourse = async studentCourse => {
  const result = await fetchRawSimple({}, qb => {
    return qb.select(knex.raw('count(sb.id)'))
      .from('student_books as sb')
      .leftJoin('student_courses as sc', 'sc.book_course_id', 'sb.course_id')
      .leftJoin('student_book_chapters as sbc', 'sb.id', 'sbc.book_id')
      .leftJoin('student_book_subchapters as sbs', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_book_contents as sbc2', 'sbs.id', 'sbc2.subchapter_id')
      .where('sbc2.content_status', BookContentStatusEnum.unseen)
      .andWhere('sb.course_id', studentCourse.id)
      .andWhere('sb.student_id', studentCourse.student_id)
  })

  return R.pipe(
    R.head,
    R.prop('count'),
    parseInt
  )(result)
}

export const deleteContentById = async (id: string, trx?) => (
  _delete(MODEL)({ id }, trx)
)

export const findOneOrFail = async (where: {}, withRelated?: string[]) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const getContentsInCourse = async studentCourse => (
  fetchRawSimple({}, qb => (
    qb.select('sbc.*')
      .from('student_book_contents as sbc')
      .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc.subchapter_id')
      .leftJoin('student_book_chapters as sbc2', 'sbc2.id', 'sbs.chapter_id')
      .leftJoin('student_books as sb', 'sb.id', 'sbc2.book_id')
      .where('sb.course_id', studentCourse.id)
  ))
)
