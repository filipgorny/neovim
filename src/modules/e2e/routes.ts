import { customParam, payload } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import resetBefore from './actions/reset-before'
import resetAfter from './actions/reset-after'

export default app => {
  app.post('/e2e/reset-before/:actionName', route(resetBefore, [customParam('actionName'), payload]))
  app.post('/e2e/reset-after/:actionName', route(resetAfter, [customParam('actionName'), payload]))
}
