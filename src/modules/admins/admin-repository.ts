import AdminDTO from './dto/admin-dto'
import { Admin } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOneWithoutDeleted,
  _findOneOrFailWithoutDeleted,
  DELETED_AT,
  _patchAll
} from '../../../utils/generics/repository'
import R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { AdminRoleEnum } from './admin-roles'
import { deleteAdmin } from './admin-service'
import mapP from '../../../utils/function/mapp'

const MODEL = Admin
const MODEL_NAME = 'Admin'

export const create = async (dto: AdminDTO) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const update = async (id: string, dto: AdminDTO) => (
  _patch(MODEL)(id, dto)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const findOne = async (where: object, fetchConfig = {}) => (
  _findOneWithoutDeleted(MODEL)(where, fetchConfig)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], disablePagination = false, fetchConfig = {}) => (
  fetchCustom(qb)(withRelated, { limit, order }, disablePagination, fetchConfig)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const findAdmins = async (query, filter) => {
  const { search, ...where } = filter || {}
  let qb = search
    ? MODEL.whereRaw(`(
      name ilike '%' || ? || '%' 
      or email ilike '%' || ? || '%'
    )`, [search, search])
    : MODEL
  qb = qb.whereNull(DELETED_AT)

  return findCustom(
    where ? qb.where(where) : qb
  )(query.limit, query.order, ['chapters.book', 'bookAdminPermissions.book', 'adminCourses.course'])
}

export const fetchFirstMasterAmin = async () => R.pipeWith(R.andThen)([
  async () => fetch(MODEL)({
    admin_role: AdminRoleEnum.master_admin,
    [DELETED_AT]: null,
  }, [], { limit: { page: 1, take: 1 }, order: { dir: 'asc', by: 'created_at' } }),
  R.prop('data'),
  collectionToJson,
  R.head,
])(true)

export const removeSoftDeleted = async () => (
  MODEL.whereNotNull(DELETED_AT).destroy({ require: false })
)

export const bulkDelete = async (ids) => (
  mapP(deleteAdmin)(ids)
)

export const findOneByEmail = async (email: string, fetchConfig = {}) => R.pipeWith(R.andThen)([
  async () => findCustom(
    MODEL
      .whereRaw('(email ilike ?)', email)
      .whereNull(DELETED_AT)
  )({ take: 1, page: 1 }, { by: 'email', dir: 'asc' }, [], false, fetchConfig),
  R.prop('data'),
  collectionToJson,
  R.ifElse(
    R.isEmpty,
    R.always(undefined),
    R.head
  ),
])(true)
