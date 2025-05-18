import { Layout } from '../../models'
import { _create } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const MODEL = Layout

export const create = async dto => (
  _create(MODEL)(dto)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)
