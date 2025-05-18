import env from '../../utils/env'
import { removeSoftDeleted } from '../../src/modules/admins/admin-repository'
import { reset } from '../../src/modules/student-exams/student-exam-repository'
import { deleteRecords as deleteScaledScores } from '../../src/modules/scaled-scores/scaled-score-repository'
import { deleteRecords as deleteScaledScoreTemplate, findOne } from '../../src/modules/scaled-score-templates/scaled-score-template-repository'

const cleanUpScaledScores = async () => {
  const scaledScoreTemplate = await findOne({ title: 'e2e-score-table-edited' })

  if (scaledScoreTemplate) {
    await deleteScaledScores({ template_id: scaledScoreTemplate.id })
    await deleteScaledScoreTemplate({ id: scaledScoreTemplate.id })
  }
}

export const cleanUp = async () => {
  if (!['development', 'test'].includes(env('NODE_ENV'))) {
    console.log('E2E clean up is possible only on development and test envs')

    return
  }

  console.log('Running E2E clean up...')

  await removeSoftDeleted()
  await cleanUpScaledScores()

  return true
}

export const resetStudentExam = async id => {
  if (!['development', 'test'].includes(env('NODE_ENV'))) {
    console.log('E2E clean up is possible only on development and test envs')

    return
  }

  console.log(`Resetting student exam (${id})`)

  return reset(id)
}
