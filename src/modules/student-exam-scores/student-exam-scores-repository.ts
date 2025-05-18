import { StudentExamScore } from '../../models'
import StudentExamScoreDto, { makeDTO } from './dto/student-exam-score-dto'
import { _create, _findOne, _findOneOrFail, _patch } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import { defaultStudentExamScores } from './default-scores-template'

const MODEL = StudentExamScore
const MODEL_NAME = 'StudentExamScore'

export const create = async (dto: StudentExamScoreDto) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, {
    limit: {},
    order: {},
  }, true)
)

export const createNewStudentExamScore = async (examTypeId, studentId, ptsArray) => (
  create(
    makeDTO(
      examTypeId,
      defaultStudentExamScores(ptsArray),
      studentId,
      true
    )
  )
)

export const updatePTS = id => async (scores: object[]) => (
  patch(id, { scores: JSON.stringify(scores) })
)

export const fetchStudentScores = async (studentId: string, withRelated: string[] = []) => (
  find({ student_id: studentId }, withRelated)
)

export const fetchStudentExamScores = async (studentId: string, typeId: string) => (
  findOne({
    student_id: studentId,
    exam_type_id: typeId,
  })
)

export const fetchStudentExamScoresOrFail = async (studentId: string, typeId: string) => (
  findOneOrFail({
    student_id: studentId,
    exam_type_id: typeId,
  })
)
