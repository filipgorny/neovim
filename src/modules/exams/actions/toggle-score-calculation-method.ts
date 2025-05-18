import * as R from 'ramda'
import { ScoreCalculationMethod } from '../score-calculation-methods'
import { findOneOrFail } from '../exam-repository'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { setScoreCalculationMethod } from '../exam-service'

type Payload = {
  method: ScoreCalculationMethod
}

const validateExamScoresAreSet = R.pipe(
  R.prop('scores'),
  R.when(
    R.isEmpty,
    () => throwException(customException('exam-scores-empty', 403, 'Exam scores are not set'))
  )
)

const isNormalMethod = R.pipe(
  R.prop('method'),
  R.equals(ScoreCalculationMethod.normal)
)

const isManufacturedMethod = R.pipe(
  R.prop('method'),
  R.equals(ScoreCalculationMethod.manufactured)
)

export default async (id: string, payload: Payload) => {
  const exam = await findOneOrFail({ id }, ['scores'])

  if (isNormalMethod(payload)) {
    return setScoreCalculationMethod(id, ScoreCalculationMethod.normal)
  }

  if (isManufacturedMethod(payload)) {
    validateExamScoresAreSet(exam)
  }

  return setScoreCalculationMethod(id, payload.method)
}
