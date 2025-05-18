import { OnboardingImage } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import OnboardingImageDTO, { OnboardingImage as OnboardingImageType } from './dto/onboarding-image'

const MODEL = OnboardingImage
const MODEL_NAME = 'OnboardingImage'

export const create = async (dto: OnboardingImageDTO, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: Partial<OnboardingImageType>) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: Partial<OnboardingImageType>) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where: Partial<OnboardingImageType> = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: Partial<OnboardingImageDTO>, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)
