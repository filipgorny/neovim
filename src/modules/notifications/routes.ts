import { id, payloadValidate, query, user, route } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'
import { authAdmin } from '../../middleware/authorize'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import { addBrokenScheduledForTransformer, addMultipleBrokenScheduledForTransformer, addMultipleRecurringEventNextDispatchTime, addRecurringEventNextDispatchTime, fixMultipleScheduledForTransformer, fixScheduledForTransformer } from './notification-transformers'

export default app => {
  app.get('/notifications', authAdmin, route(Actions.fetchNotifications, [user, query], [addMultipleBrokenScheduledForTransformer, addMultipleRecurringEventNextDispatchTime]))
  app.get('/notifications/:id', authAdmin, route(Actions.fetchNotification, [id], [addBrokenScheduledForTransformer, addRecurringEventNextDispatchTime]))

  app.post('/notifications', authAdmin, route(Actions.createNotification, [payloadValidate(Validation.createNotificationSchema)], [addBrokenScheduledForTransformer, addRecurringEventNextDispatchTime]))
  app.post('/notifications/:id/send', permCheck(GlobalPerms.N), route(Actions.sendNotificationById, [id]))
  app.post('/notifications/:id/pause', permCheck(GlobalPerms.N), route(Actions.pauseNotificaiton, [id]))
  app.post('/notifications/:id/unpause', permCheck(GlobalPerms.N), route(Actions.unpauseNotificaiton, [id]))

  app.patch('/notifications/:id', authAdmin, route(Actions.updateNotification, [id, payloadValidate(Validation.updateNotificationSchema)], [addBrokenScheduledForTransformer, addRecurringEventNextDispatchTime]))

  app.delete('/notifications/:id/soft', permCheck(GlobalPerms.N), route(Actions.deleteNotification, [id]))
  app.delete('/notifications/:id/hard', authAdmin, route(Actions.deleteNotificationForStudents, [id]))
}
