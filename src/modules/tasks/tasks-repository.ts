import { Task } from '../../models'
import { fetch } from '../../../utils/model/fetch'

const MODEL = Task

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)
