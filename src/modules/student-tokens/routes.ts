import { route } from '../../../utils/route/attach-route'
import exampleAction from './actions/example-action'

export default app => {
  app.get('/student-tokens/example-route', route(exampleAction))
}
