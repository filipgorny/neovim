import { ExamLog } from '../../models'
import { _create } from '../../../utils/generics/repository'
import ExamLogDTO from './dto/exam-log-dto'
import { fetch } from '../../../utils/model/fetch'

const MODEL = ExamLog

export const create = async (dto: ExamLogDTO, trx?) => (
  _create(MODEL)(dto, trx)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)
