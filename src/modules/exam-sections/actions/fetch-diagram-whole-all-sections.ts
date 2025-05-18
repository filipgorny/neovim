import * as R from 'ramda'
import { findOneOrFailWithDeleted } from '../../exams/exam-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { getStudentExamSectionsStatsData } from '../exam-section-service'

export default async (exam_id: string) => {
  const exam = await findOneOrFailWithDeleted({ id: exam_id }, ['sections'])

  const sectionIds = R.pipe(
    R.prop('sections'),
    R.sortBy(R.prop('order')),
    R.pluck('id')
  )(exam)

  const diagramData = await mapP(
    getStudentExamSectionsStatsData
  )(sectionIds)

  return diagramData
}
