import * as R from 'ramda'
import orm, { StudentExamSection } from '../../models'
import StudentExamSectionDTO from './dto/student-exam-section-dto'
import { _create, _deleteAll, _findOneOrFail, _patch } from '../../../utils/generics/repository'
import { int } from '../../../utils/number/int'

const { knex } = orm.bookshelf

const MODEL = StudentExamSection
const MODEL_NAME = 'StudentExamSection'

export const create = async (dto: StudentExamSectionDTO) => (
  _create(MODEL)(dto)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const dropSectionsWithIds = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)

const fromExamSectionsAndWithQuestions = () => (
  knex
    .from({ ses: 'student_exam_sections' })
    .leftJoin({ sep: 'student_exam_passages' }, 'ses.id', 'sep.student_section_id')
    .leftJoin({ seq: 'student_exam_questions' }, 'sep.id', 'seq.student_passage_id')
)

export const countQuestions = async (sectionId: string) => (
  R.pipeWith(R.andThen)([
    async () => fromExamSectionsAndWithQuestions()
      .where({ 'ses.id': sectionId })
      .whereNotNull('seq.id')
      .countDistinct('seq.id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const countCorrectlyAnsweredQuestions = async (sectionId: string) => (
  R.pipeWith(R.andThen)([
    async () => fromExamSectionsAndWithQuestions()
      .where({ 'ses.id': sectionId })
      .whereRaw('seq.correct_answer = seq.answer')
      .whereNotNull('seq.id')
      .countDistinct('seq.id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)
