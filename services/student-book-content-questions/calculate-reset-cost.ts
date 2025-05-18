import * as R from 'ramda'
import { SaltyBucksOperationSubtype } from '../../src/modules/salty-bucks-log/salty-bucks-operation-subtype'
import { findByName as findSettingByName } from '../../src/modules/app-settings/app-settings-repository'
import { int } from '@desmart/js-utils/dist/number'

export const getContentQuestionsFromChapter = R.pipe(
  R.prop('subchapters'),
  R.map(
    R.pipe(
      R.prop('contents'),
      R.pluck('questions')
    )
  ),
  R.flatten
)

export const rejectUnansweredQuestions = R.reject(
  R.propEq('answered_at', null)
)

const calculateQuestionResetCost = singleResetCost => amount => (
  int(amount) * int(singleResetCost)
)

export const calculateChapterResetCost = baseResetCost => chapter => (
  R.pipe(
    getContentQuestionsFromChapter,
    rejectUnansweredQuestions,
    R.propOr(0, 'length'),
    calculateQuestionResetCost(baseResetCost),
    R.objOf('chapter_reset_cost')
  )(chapter)
)

export const calculateResetCost = async (chapter) => {
  const settingName = SaltyBucksOperationSubtype.resetChapterContentQuestions
  const saltyBucksSetting = await findSettingByName(settingName)

  return calculateChapterResetCost(saltyBucksSetting.value)(chapter)
}
