import { route } from '../../../utils/route/attach-route'
import { id, user } from '@desmart/js-utils'
import { authStudent } from '../../middleware/authorize'
import Actions from './actions'

export default app => {
  app.get('/favourite-videos', authStudent, route(Actions.fetchAllFavouriteVideos, [user]))

  app.patch('/favourite-videos/:id', authStudent, route(Actions.markVideoAsFavourite, [user, id]))
}
