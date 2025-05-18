import * as R from 'ramda'
import orm, { ExamSection } from '../../models'
import ExamSectionDto from './dto/exam-section-dto'
import { _create, _patch, _findOneOrFail, _findOne } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import { int } from '../../../utils/number/int'

const { knex } = orm.bookshelf

const MODEL = ExamSection
const MODEL_NAME = 'ExamSection'

export const create = async (dto: ExamSectionDto) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findOne = async (where: object, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

const fromExamSectionsAndWithQuestions = () => (
  knex
    .from({ es: 'exam_sections' })
    .leftJoin({ ep: 'exam_passages' }, 'es.id', 'ep.section_id')
    .leftJoin({ eq: 'exam_questions' }, 'ep.id', 'eq.passage_id')
)

export const countQuestions = async (sectionId: string) => (
  R.pipeWith(R.andThen)([
    async () => fromExamSectionsAndWithQuestions()
      .where({ 'es.id': sectionId })
      .whereNotNull('eq.id')
      .countDistinct('eq.id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const getIds = async () => (
  R.pipeWith(R.andThen)([
    async () => knex.select('id').from('exam_sections'),
    R.pluck('id'),
  ])(true)
)
