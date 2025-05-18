import StudentBookSubchapterDTO from './dto/student-book-subchapter-dto'
import orm, { StudentBookSubchapter } from '../../models'
import { _create, _findOneOrFail, _delete } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const { knex } = orm.bookshelf

const MODEL = StudentBookSubchapter
const MODEL_NAME = 'StudentBookSubchapter'

type FindSubchaptersWithNotesCommand = { chapterId: string }

export const create = async (dto: StudentBookSubchapterDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findSubchaptersWithNotes = async (command: FindSubchaptersWithNotesCommand) => {
  return knex({ sbs: 'student_book_subchapters' })
    .select(
      'sbs.*',
      knex.raw('COALESCE(json_agg(sbsn.*) FILTER (WHERE sbsn IS NOT NULL), \'[]\'::json) as notes')
    )
    .where({ 'sbs.chapter_id': command.chapterId })
    .leftJoin({ sbsn: 'student_book_subchapter_notes' }, 'sbsn.subchapter_id', 'sbs.id')
    .groupBy('sbs.id', 'sbs.order', 'sbs.part')
    .orderBy([
      { column: 'sbs.order', order: 'asc' },
      { column: 'sbs.part', order: 'asc' },
    ])
}

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const deleteSubchapterById = async (id: string) => (
  _delete(MODEL)({ id })
)
