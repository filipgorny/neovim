import { route, query } from '../../../utils/route/attach-route'
import fetchAllLayouts from './actions/fetch-all-layouts'

export default app => {
  app.get('/layouts', route(fetchAllLayouts, [query]))
}
