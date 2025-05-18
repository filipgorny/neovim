import orm, { ExamType } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import { _create, _findOneOrFail, _findOne, _patch, DELETED_AT } from '../../../utils/generics/repository'

const MODEL = ExamType
const MODEL_NAME = 'ExamType'

export const create = async dto => (
  _create(MODEL)(dto)
)

export const findOne = async (where, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where, withRelated?) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const getExamTypesDictionary = async () => (
  fetchCustom(
    MODEL.query({
      distinct: 'type',
      groupBy: 'type',
    })
  )([], undefined, true)
)

export const getExamSubtypesDictionary = async (type: string) => (
  fetchCustom(
    MODEL.where({
      type,
    }).query({
      distinct: 'subtype',
      groupBy: 'subtype',
    })
  )([], undefined, true)
)

export const remove = async (id: string, title: string) => (
  _patch(MODEL)(id, {
    title,
    [DELETED_AT]: new Date(),
  })
)

export const getTypeLabels = () => (
  orm.bookshelf.knex
    .select('type_label')
    .from({ et: 'exam_types' })
    .whereNotNull('type_label')
    .orderBy('type_label', 'asc')
)
