import StudentBookContentAttachmentDTO from './dto/student-book-content-attachment-dto'
import orm, { StudentBookContentAttachment } from '../../models'
import { _create, DELETED_AT, _deleteAllByCustomColumn } from '../../../utils/generics/repository'
import R from 'ramda'

const { knex } = orm.bookshelf

interface CheckIfSpecifiedBookContentAttachmentExistCommand {
  studentId: string;
  attachmentId: string;
}

interface PatchCommand {
  id: string;
  data: object;
  select?: string[];
}

const MODEL = StudentBookContentAttachment
const MODEL_NAME = 'StudentBookContentAttachment'

export const create = async (dto: StudentBookContentAttachmentDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const checkIfSpecifiedBookContentAttachmentExist = async (command: CheckIfSpecifiedBookContentAttachmentExistCommand) => {
  const result = await knex({ sbca: 'student_book_content_attachments' })
    .count('sbca.id')
    .where({ 'sbca.id': command.attachmentId })
    .innerJoin({ sbc: 'student_book_contents' }, 'sbc.id', 'sbca.content_id')
    .innerJoin({ sbsc: 'student_book_subchapters' }, 'sbsc.id', 'sbc.subchapter_id')
    .innerJoin({ sbch: 'student_book_chapters' }, 'sbch.id', 'sbsc.chapter_id')
    .innerJoin({ sb: 'student_books' }, join => {
      join.on('sb.id', 'sbch.book_id')
        .andOnIn('sb.student_id', [command.studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .first()

  return Boolean(parseInt(result.count as string, 10))
}

export const patch = async (command: PatchCommand) => {
  const result = await knex('student_book_content_attachments')
    .where({ id: command.id })
    .update(command.data, command.select ?? ['*'])

  return R.head(result)
}

export const deleteAttachmentsByContentId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('content_id', [content_id])
)
