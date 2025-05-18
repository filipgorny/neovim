import * as R from 'ramda'
import StudentBookChapterDTO from './dto/student-book-chapter-dto'
import orm, { StudentBooksChapter } from '../../models'
import { _create, DELETED_AT, _findOneOrFail, _delete, _patch } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const { knex } = orm.bookshelf

interface CheckIfSpecifiedChapterExistCommand {
  studentId: string;
  chapterId: string;
}

const MODEL = StudentBooksChapter
const MODEL_NAME = 'StudentBooksChapter'

export const create = async (dto: StudentBookChapterDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const checkIfSpecifiedChapterExist = async (command: CheckIfSpecifiedChapterExistCommand) => {
  const result = await knex({ sbc: 'student_book_chapters' })
    .count('sbc.id')
    .where({ 'sbc.id': command.chapterId })
    .innerJoin({ sb: 'student_books' }, join => {
      join.on('sbc.book_id', 'sb.id')
        .andOnIn('sb.student_id', [command.studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .first()

  return Boolean(parseInt(result.count as string, 10))
}

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findOneOrFail = async (where: {}, withRelated: string[]) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const deleteChapterById = async (id: string) => (
  _delete(MODEL)({ id })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const getListOfChapterIdsByBookId = async (book_id: string): Promise<string[]> => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sbc: 'student_book_chapters' })
      .where({ book_id }),
    R.pluck('id'),
  ])(true)
)
