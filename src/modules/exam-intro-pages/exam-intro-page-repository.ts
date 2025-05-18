import orm, { ExamIntroPage } from '../../models'
import { _create, _findOneOrFail, _patch, _patchRaw } from '../../../utils/generics/repository'
import ExamIntroPageDTO from './dto/exam-intro-page-dto'
import { fetch } from '../../../utils/model/fetch'

const MODEL = ExamIntroPage
const MODEL_NAME = 'ExamIntroPage'

const knex = orm.bookshelf.knex

export const create = async (dto: ExamIntroPageDTO) => (
  _create(MODEL)(dto)
)

export const findOneOrFail = async (where, withRelated?) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query, true)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const updateIntroPagesBulk = async (intro_pages: Array<{id: string}>) => (
  knex.transaction(
    _patchRaw(knex, 'exam_intro_pages')(intro_pages)
  )
)
