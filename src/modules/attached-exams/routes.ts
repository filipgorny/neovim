import { customParam, route } from '@desmart/js-utils'
import { authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'

export default app => {
  app.patch('/attached-exams/:course_id/exam/:exam_id', authMasterAdmin, route(Actions.toggleFreeTrialExam, [customParam('course_id'), customParam('exam_id')]))
  app.patch('/attached-exams/:course_id/exam-featured/:exam_id', authMasterAdmin, route(Actions.toggleFeaturedFreeTrialExam, [customParam('course_id'), customParam('exam_id')]))
}
