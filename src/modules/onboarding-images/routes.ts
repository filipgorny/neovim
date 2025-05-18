import { Router } from 'express'
import { route } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { customParam, files, id, payloadValidate } from '@desmart/js-utils'
import { authMasterAdmin, authStudentOrAdmin } from '../../middleware/authorize'

export default (app: Router): void => {
  app.post('/onboarding-images', authMasterAdmin, route(Actions.createOnboardingImage, [files, payloadValidate(Validation.createOnboardingImageSchema)]))

  app.get('/onboarding-images/:id', authStudentOrAdmin, route(Actions.fetchOnboardingImageById, [id]))
  app.get('/onboarding-images/category/:category_id', authStudentOrAdmin, route(Actions.fetchOnboardingImagesForCategory, [customParam('category_id')]))
  app.get('/onboarding-images/category/:category_id/order', authStudentOrAdmin, route(Actions.fetchOnboardingImageByCategoryAndOrder, [customParam('category_id'), payloadValidate(Validation.fetchOnboardingImageByCategoryAndOrderSchema)]))

  app.patch('/onboarding-images/:id', authMasterAdmin, route(Actions.updateOnboardingImage, [id, payloadValidate(Validation.updateOnboardingImageSchema), files]))
  app.patch('/onboarding-images/:id/reorder/:direction', authMasterAdmin, route(Actions.reorderOnboardingImages, [id, customParam('direction')]))

  app.delete('/onboarding-images/:id', authMasterAdmin, route(Actions.deleteOnboardingImage, [id]))
}
