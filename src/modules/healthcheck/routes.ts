import { query, route } from '@desmart/js-utils'
import { healthCheck } from './actions/healthcheck'

export default (app: any) => {
  app.get('/healthcheck', route(healthCheck, [query]))
}
