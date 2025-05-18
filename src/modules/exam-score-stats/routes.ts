import { route } from '../../../utils/route/attach-route'
import Actions from './actions'

export default app => {
  app.get('/example-route', route(Actions.exampleAction))
}
