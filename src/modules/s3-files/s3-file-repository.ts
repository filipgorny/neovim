import s3FileDTO from './dto/s3-file-dto'
import { s3File } from '../../models'
import {
  _create,
  _patch,
  _findOneOrFail
} from '../../../utils/generics/repository'

const MODEL = s3File
const MODEL_NAME = 's3File'

export const create = async (dto: s3FileDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const remove = async (id: string) => (
  _patch(MODEL)(id, { deleted_at: new Date() })
)
