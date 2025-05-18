import { id, payloadValidate, route } from '../../../utils/route/attach-route'
import { authAdmin, authMasterAdmin } from '../../middleware/authorize'
import setSectionScores from './actions/set-section-scores'
import { schema as setSectionScoresSchema } from './validation/schema/set-section-scores-schema'
import { schema as setAllScoresSchema } from './validation/schema/set-all-scores-schema'
import setAllScores from './actions/set-all-scores'
import fetchScores from './actions/fetch-scores'
import fetchDiagramData from './actions/fetch-diagram-data'
import mockDiagramData from './actions/mock-diagram-data'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import fetchDiagramWholeAllSections from './actions/fetch-diagram-whole-all-sections'
import { customParam } from '@desmart/js-utils'

export default app => {
  app.patch('/exam-sections/:id/scores', permCheck(GlobalPerms.T), route(setSectionScores, [id, payloadValidate(setSectionScoresSchema)]))

  app.post('/exam-sections/:id/set-all-scores', permCheck(GlobalPerms.T), route(setAllScores, [id, payloadValidate(setAllScoresSchema)]))

  app.get('/exam-sections/:id/scores', permCheck(GlobalPerms.T), route(fetchScores, [id]))
  app.get('/exam-sections/:id/diagram', route(fetchDiagramData, [id]))
  app.get('/exam-sections/exam/:exam_id/diagram-all', route(fetchDiagramWholeAllSections, [customParam('exam_id')]))
  app.get('/exam-sections/mock-diagram/get-data', route(mockDiagramData))
}
