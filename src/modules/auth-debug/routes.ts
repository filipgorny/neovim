import { query } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import zoomOauth from './actions/zoom-oauth'

export default app => {
  app.get('/zoom-oauth', route(zoomOauth, [query]))
}
