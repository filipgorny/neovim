import { route } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import Actions from './actions'

export default app => {
  app.get('/memory-usage', authAdmin, route(Actions.fetchMemoryUsage))
  app.get('/memory-usage/convert', authAdmin, route(Actions.fetchMemoryUsageConvert))

  app.post('/memory-usage/heap-snapshot', authAdmin, route(Actions.takeHeapSnapshot))
}
