import { createFullMcatExamType } from '../../exam-types/__tests__/create-full-mcat-exam-type.help'
import { cretateLayout } from '../../layouts/layout-service'
import createFromXlsx from '../actions/create-from-xlsx'
import fs from 'fs'
import { ScoreCalculationMethod } from '../score-calculation-methods'

export const createFullMcatExam = async (admin, examTypeTitle: string, layoutTitle: string, title: string, external_id: string) => {
  const examType = await createFullMcatExamType(examTypeTitle)

  const data = fs.readFileSync('storage/mock-exams/BETA-FULL-MCAT.xlsx')

  const layout = await cretateLayout(layoutTitle)

  return createFromXlsx(
    {
      file: {
        data,
      },
    },
    admin,
    {
      layout_id: layout.toJSON().id,
      exam_type_id: examType.id,
      title,
      external_id,
      google_form_url: '',
      score_calculation_method: ScoreCalculationMethod.scaled,
      periodic_table_enabled: false,
      max_completions: 1,
    }
  )
}
