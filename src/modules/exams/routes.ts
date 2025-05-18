import { route, files, user, payload, id, query, routeRaw, customParam, payloadValidate, request } from '../../../utils/route/attach-route'
import createFromXlsx from './actions/create-from-xlsx'
import setExternalId from './actions/set-external-id'
import setAccessPeriod from './actions/set-access-period'
import fetchAll from './actions/fetch-all'
import deleteExam from './actions/delete-exam'
import fetchLogs from './actions/fetch-logs'
import bulkDeleteExams from './actions/bulk-delete-exam'
import exportCsv from './actions/export-csv'
import previewExam from './actions/preview-exam'
import fetchAllByType from './actions/fetch-all-by-type'
import reuploadXlsx from './actions/reupload-xlsx'
import setGoogleFormUrl from './actions/set-google-form-url'
import setAllScores from './actions/set-all-scores'
import fetchScores from './actions/fetch-scores'
import toggleScoreCalculationMethod from './actions/toggle-score-calculation-method'
import setTitle from './actions/set-title'
import setPeriodicTableFlag from './actions/set-periodic-table-flag'
import mockDiagramData from './actions/mock-diagram-data'
import initializeExamScoreStats from './actions/initialize-exam-score-stats'
import getExam from './actions/get-exam'
import patchExam from './actions/patch-exam'
import fetchDiagramDataWithPreviouslyCalculatedPercentileRank from './actions/fetch-diagram-data-with-previously-calculated-percentile-rank'
import fetchDiagramDataWithUpToDatePercentileRank from './actions/fetch-diagram-data-with-up-to-date-percentile-rank'
import downloadExamResults from './actions/download-exam-results'
import setReviewVideoId from './actions/set-review-video-id'
import setCustomTitle from './actions/set-custom-title'
import setMaxCompletions from './actions/set-max-completions'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import { authAdmin } from '../../middleware/authorize'

import { schema as setAllScoresSchema } from './validation/schema/set-all-scores-schema'
import { schema as toggleScoreCalculationMethodSchema } from './validation/schema/toggle-score-calculation-method-schema'
import { schema as createExamSchema } from './validation/schema/create-exam-schema'
import { schema as exportCsvSchema } from './validation/schema/export-csv-schema'
import { schema as setAccessPeriodSchema } from './validation/schema/set-access-period-schema'
import { schema as setTitleSchema } from './validation/schema/set-title-schema'
import { schema as patchExamSchema } from './validation/schema/patch-exam-schema'
import { schema as setCustomTitleSchema } from './validation/schema/set-custom-title-schema'
import { schema as setMaxCompletionsSchema } from './validation/schema/set-max-completions-schema'
import { getCourseIdsAccessibleToAdmin } from '../../middleware/check-course-admin'

export default app => {
  app.post('/exams/create-from-xlsx', permCheck(GlobalPerms.E), route(createFromXlsx, [files, user, payloadValidate(createExamSchema)]))
  app.post('/exams/export-csv', permCheck(GlobalPerms.E), routeRaw(exportCsv, [payloadValidate(exportCsvSchema)]))
  app.post('/exams/:id/preview', authAdmin, getCourseIdsAccessibleToAdmin, route(previewExam, [user, id, request]))
  app.post('/exams/:id/reupload', permCheck(GlobalPerms.E), route(reuploadXlsx, [id, files, user]))
  app.post('/exams/:id/set-all-scores', permCheck(GlobalPerms.T), route(setAllScores, [id, payloadValidate(setAllScoresSchema)]))
  app.post('/exams/:id/initialize-exam-score-stats', permCheck(GlobalPerms.T), route(initializeExamScoreStats, [id]))

  app.patch('/exams/bulk', permCheck(GlobalPerms.E), route(bulkDeleteExams, [user, payload]))
  app.patch('/exams/:id', permCheck(GlobalPerms.E), route(patchExam, [id, payloadValidate(patchExamSchema), files, user]))
  app.patch('/exams/:id/external-id', permCheck(GlobalPerms.E), route(setExternalId, [id, payload, user]))
  app.patch('/exams/:id/access-period', permCheck(GlobalPerms.E), route(setAccessPeriod, [id, payloadValidate(setAccessPeriodSchema), user]))
  app.patch('/exams/:id/google-form', permCheck(GlobalPerms.E), route(setGoogleFormUrl, [id, payload]))
  app.patch('/exams/:id/toggle-score-calculation-method', permCheck(GlobalPerms.T), route(toggleScoreCalculationMethod, [id, payloadValidate(toggleScoreCalculationMethodSchema)]))
  app.patch('/exams/:id/title', permCheck(GlobalPerms.E), route(setTitle, [id, payloadValidate(setTitleSchema), user]))
  app.patch('/exams/:id/periodic-table', permCheck(GlobalPerms.E), route(setPeriodicTableFlag, [id, payload]))
  app.patch('/exams/:id/review-video', permCheck(GlobalPerms.E), route(setReviewVideoId, [id, payload]))
  app.patch('/exams/:id/custom-title', permCheck(GlobalPerms.E), route(setCustomTitle, [id, payloadValidate(setCustomTitleSchema)]))
  app.patch('/exams/:id/max-completions', permCheck(GlobalPerms.E), route(setMaxCompletions, [id, payloadValidate(setMaxCompletionsSchema)]))

  app.get('/exams', authAdmin, getCourseIdsAccessibleToAdmin, route(fetchAll, [query, user]))
  app.get('/exams/:type', authAdmin, route(fetchAllByType, [customParam('type')]))
  app.get('/exams/:id/details', authAdmin, route(getExam, [id]))
  app.get('/exams/:id/logs', permCheck(GlobalPerms.E), route(fetchLogs, [id, query]))
  app.get('/exams/:id/scores', permCheck(GlobalPerms.T), route(fetchScores, [id]))
  app.get('/exams/mock-diagram/get-data', route(mockDiagramData))
  app.get('/exams/:id/diagram', route(fetchDiagramDataWithPreviouslyCalculatedPercentileRank, [id]))
  app.get('/exams/:id/diagram/calc-percentile-rank', permCheck(GlobalPerms.E), route(fetchDiagramDataWithUpToDatePercentileRank, [id]))
  app.get('/exams/:id/download-scores', permCheck(GlobalPerms.E), route(downloadExamResults, [id]))

  app.delete('/exams/:id', permCheck(GlobalPerms.E), route(deleteExam, [id, user]))
}
