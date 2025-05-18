import { route, user, id, payload, customParam, impersonate, query, studentCourse, payloadValidate, request } from '../../../utils/route/attach-route'
import { authStudent, authRealStudent, authImpersonatorAdmin, authImpersonatorOrAdmin, authAdmin, Role, allow, authMasterAdmin } from '../../middleware/authorize'
import getExamDetails from './actions/get-exam-details'
import saveState from './actions/save-state'
import changeHtml from './actions/change-html'
import startExam from './actions/start-exam'
import resumeExam from './actions/resume-exam'
import finishExam from './actions/finish-exam'
import saveTimers from './actions/save-timers'
import resetExam from './actions/reset-exam'
import togglePtsExclusion from './actions/toggle-pts-exclusion'
import scoreProjectionData from './actions/score-projection-data'
import finishSection from './actions/finish-section'
import getSectionScoreTable from './actions/get-section-score-table'
import getExamPassages from './actions/get-exam-passages'
import fetchLogs from './actions/fetch-logs'
import changeAccessPeriod from './actions/change-access-period'
import getTargetScoreDetails from './actions/target-score-details'
import getExams from './actions/get-exams'
import purchaseExam from './actions/purchase-exam'
import { studentCourseContext, studentCourseContextOptional } from '../../middleware/student-course-context'

import { schema as saveStateSchema } from './validation/schema/save-exam-schema'
import { schema as changeHtmlSchema } from './validation/schema/change-html-schema'
import { schema as startExamSchema } from './validation/schema/start-exam-schema'
import { schema as saveTimersSchema } from './validation/schema/save-timers-schema'
import { schema as changeAccessPeriodSchema } from './validation/schema/change-access-period-schema'
import { schema as purchaseExamSchema } from './validation/schema/purchase-exam-schema'
import { schema as updateMaxCompletionsSchema } from './validation/schema/update-max-completions-schema'
import deleteStudentExam from './actions/delete-student-exam'
import updateMaxCompletions from './actions/update-max-completions'
import fetchRetakes from './actions/fetch-retakes'
import updateExamSecondsLeft from './actions/update-exam-seconds-left'
import getFreeTrialExamIdsForCourse from './actions/get-free-trial-exam-ids-for-course'
import getFreeTrialExamsFull from './actions/get-free-trial-exams-full'

export default app => {
  app.get('/student-exams', allow(Role.igor, Role.retail), route(getExams, [query]))
  app.get('/student-exams/free-trial-exams', authStudent, studentCourseContext, route(getFreeTrialExamIdsForCourse, [studentCourse]))
  app.get('/student-exams/free-trial-exams-full', authStudent, studentCourseContext, route(getFreeTrialExamsFull, [studentCourse]))
  app.get('/student-exams/:id', authStudent, route(getExamDetails, [user, id]))
  app.get('/student-exams/:exam_type_id/target-score', authStudent, route(getTargetScoreDetails, [user, customParam('exam_type_id')]))
  app.get('/student-exams/:id/reset', route(resetExam, [id]))
  app.get('/student-exams/:id/passages', authStudent, route(getExamPassages, [user, id]))
  app.get('/student-exams/:id/logs', authImpersonatorAdmin, route(fetchLogs, [id, query]))
  app.get('/student-exams/:id/section-score-table/:section_id', authStudent, route(getSectionScoreTable, [user, id, customParam('section_id')]))
  app.get('/student-exams/score-projection-data/:exam_type_id', authStudent, route(scoreProjectionData, [user, customParam('exam_type_id')]))
  app.get('/student-exams/:id/retakes', authStudent, route(fetchRetakes, [id]))

  app.post('/student-exams/purchase', route(purchaseExam, [request, payloadValidate(purchaseExamSchema)]))

  app.patch('/student-exams/:id/save', authRealStudent, route(saveState, [user, id, payloadValidate(saveStateSchema)]))
  app.patch('/student-exams/:id/exam-seconds-left', authRealStudent, route(updateExamSecondsLeft, [user, id, payload]))
  app.patch('/student-exams/:id/change-html', authStudent, route(changeHtml, [user, id, payloadValidate(changeHtmlSchema)]))
  app.patch('/student-exams/:id/start', authRealStudent, studentCourseContextOptional, route(startExam, [user, id, payloadValidate(startExamSchema), studentCourse]))
  app.patch('/student-exams/:id/resume', authRealStudent, route(resumeExam, [user, id]))
  app.patch('/student-exams/:id/finish', authRealStudent, studentCourseContextOptional, route(finishExam, [user, id, studentCourse]))
  app.patch('/student-exams/:id/timers', authStudent, route(saveTimers, [user, id, payloadValidate(saveTimersSchema)]))
  app.patch('/student-exams/:id/toggle-pts-exclusion', authRealStudent, route(togglePtsExclusion, [user, id]))
  app.patch('/student-exams/:id/finish-section/:section_id', authRealStudent, route(finishSection, [user, id, customParam('section_id')]))
  app.patch('/student-exams/:id/change-access-period', authImpersonatorOrAdmin, route(changeAccessPeriod, [id, user, impersonate, payloadValidate(changeAccessPeriodSchema)]))
  app.patch('/student-exams/:id/max-completions', authAdmin, route(updateMaxCompletions, [id, payloadValidate(updateMaxCompletionsSchema)]))

  app.delete('/student-exams/:id', authMasterAdmin, route(deleteStudentExam, [id]))
}
