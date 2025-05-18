import R from 'ramda'
import { find as findExamTypes, patch as patchExamType } from '../../src/modules/exam-types/exam-type-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import mapP from '../../utils/function/mapp'
import { getSetting } from '../../src/modules/settings/settings-service'
import { countCompletedExamsWithType } from '../../src/modules/student-exams/student-exam-repository'
import { Settings } from '../../src/modules/settings/settings'

const fetchExamTypes = async () => (
  R.pipeWith(R.andThen)([
    async () => findExamTypes({ limit: {}, order: {} }, { score_calculations_enabled: false }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const updateScoreCalculationsEnabled = async type => {
  const examCount = await countCompletedExamsWithType(type.id)
  const minimumValue = await getSetting(Settings.MinimumExamsTakenForShowingScores)

  if (examCount >= minimumValue) {
    await patchExamType(type.id, { score_calculations_enabled: true })
  }
}

export const evaluateScoreCalculationsEnabled = async () => {
  const examTypes = await fetchExamTypes()

  await mapP(
    updateScoreCalculationsEnabled
  )(examTypes)

  return true
}
