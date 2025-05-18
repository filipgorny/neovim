import { route, payload, id } from '../../../utils/route/attach-route'
import createScaledScoreTemplate from './actions/create-scaled-score-template'
import updateScaledScoreTemplate from './actions/update-scaled-score-template'
import fetchAllScaledScoreTemplates from './actions/fetch-all-scaled-score-templates'
import upsertScores from './actions/upsert-scores'
import fetchDetails from './actions/fetch-details'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'

export default app => {
  app.post('/scaled-score-templates', permCheck(GlobalPerms.T), route(createScaledScoreTemplate, [payload]))
  app.patch('/scaled-score-templates/:id', permCheck(GlobalPerms.T), route(updateScaledScoreTemplate, [id, payload]))
  app.get('/scaled-score-templates', permCheck(GlobalPerms.T), route(fetchAllScaledScoreTemplates))
  app.post('/scaled-score-templates/:id/upsert-scores', permCheck(GlobalPerms.T), route(upsertScores, [id, payload]))
  app.get('/scaled-score-templates/:id', permCheck(GlobalPerms.T), route(fetchDetails, [id]))
}
