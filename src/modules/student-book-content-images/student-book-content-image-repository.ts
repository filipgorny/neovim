import StudentBookContentImageDTO from './dto/student-book-content-image-dto'
import { StudentBookContentImage } from '../../models'
import { _create, _deleteAllByCustomColumn } from '../../../utils/generics/repository'

const MODEL = StudentBookContentImage
const MODEL_NAME = 'StudentBookContentImage'

export const create = async (dto: StudentBookContentImageDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const deleteAttachmentsByContentId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('content_id', [content_id])
)
