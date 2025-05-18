import { Router } from 'express'
import { route } from '../../../utils/route/attach-route'
import Actions from './actions'
import { authStudentOrAdmin } from '../../middleware/authorize'

export default (app: Router): void => {
  app.get('/video-categories', authStudentOrAdmin, route(Actions.getVideoCategoriesArray))
}
