import { query } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import getProducts from './actions/get-products'

export default app => {
  app.get('/products', authAdmin, route(getProducts, [query]))
}
