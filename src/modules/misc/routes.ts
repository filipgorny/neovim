import { route } from '../../../utils/route/attach-route'
import e2eCleanUp from './actions/e2e-clean-up'

export default app => {
  app.post('/misc/e2e-clean-up', route(e2eCleanUp))
}
