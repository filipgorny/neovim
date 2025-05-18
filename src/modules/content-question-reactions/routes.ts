import { files, id, payload, payloadValidate, query, route } from '../../../utils/route/attach-route'
import createReaction from './actions/create-reaction'
import fetchAll from './actions/fetch-all'
import fetchOne from './actions/fetch-one'
import updateReaction from './actions/update-reaction'
import getRandomReaction from './actions/get-random-reaction'
import deleteReaction from './actions/delete-reaction'
import bulkDelete from './actions/bulk-delete'
import { schema as createReactionSchema } from './validation/schema/create-reaction-schema'
import { schema as updateReactionSchema } from './validation/schema/update-reaction-schema'
import { transformReaction } from './actions/transformers/transform-reaction'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'

export default app => {
  app.post('/content-question-reactions', permCheck(GlobalPerms.A), route(createReaction, [files, payloadValidate(createReactionSchema)], [transformReaction]))

  app.get('/content-question-reactions', permCheck(GlobalPerms.A), route(fetchAll, [query]))
  app.get('/content-question-reactions/random', route(getRandomReaction))
  app.get('/content-question-reactions/:id', route(fetchOne, [id], [transformReaction]))

  app.patch('/content-question-reactions/bulk-delete', permCheck(GlobalPerms.A), route(bulkDelete, [payload]))
  app.patch('/content-question-reactions/:id', permCheck(GlobalPerms.A), route(updateReaction, [id, files, payloadValidate(updateReactionSchema)], [transformReaction]))

  app.delete('/content-question-reactions/:id', permCheck(GlobalPerms.A), route(deleteReaction, [id]))
}
