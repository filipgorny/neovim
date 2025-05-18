import { fileSchema } from '../validation/schema/create-exam-type-schema'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { buildExamScaledScoreTemplateFromCsv } from '../../../../services/exam-types/build-exam-scaled-score-template-from-csv'

export default async files => {
  validateFilesPayload(fileSchema)(files)

  const { examScaledScoreTemplateXml } = files

  return buildExamScaledScoreTemplateFromCsv(examScaledScoreTemplateXml)
}
