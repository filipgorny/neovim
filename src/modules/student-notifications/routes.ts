import * as R from 'ramda'
import { customParam, user } from '@desmart/js-utils'
import { route, userId, id, student } from '../../../utils/route/attach-route'
import Actions from './actions'
import { authStudent, authStudentOrAdmin } from '../../middleware/authorize'

export default app => {
  app.get('/student-notifications/student/:student_id', authStudentOrAdmin, route(Actions.fetchNotificationsForStudent, [customParam('student_id'), user, R.path(['query', 'limit'])]))
  app.get('/student-notifications/unseen-count', authStudent, route(Actions.getUnseenCount, [userId], [R.prop(0)]))

  app.post('/student-notifications/all/read', authStudent, route(Actions.markAllNotificationsAsRead, [user]))
  app.post('/student-notifications/all/see', authStudent, route(Actions.markAllNotificationsAsSeen, [userId]))
  app.post('/student-notifications/:id/read', authStudent, route(Actions.markNotificationAsRead, [user, customParam('id')]))
  app.post('/student-notifications/:id/unread', authStudent, route(Actions.markNotificationAsUnread, [student, id]))

  app.patch('/student-notifications/:id/flag', authStudent, route(Actions.toggleFlag, [user, customParam('id')]))
}
