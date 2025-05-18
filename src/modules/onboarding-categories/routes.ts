import { route, payloadValidate, id, customParam, files } from '@desmart/js-utils'
import { authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import reorderOnboardingCategories from './actions/reorder-onboarding-categories'

export default app => {
  app.post('/onboarding-categories', authMasterAdmin, route(Actions.createOnboardingCategory, [files, payloadValidate(Validation.createOnboardingCategory)]))

  app.get('/onboarding-categories', route(Actions.fetchAllOnboardingCategories))
  app.get('/onboarding-categories/:id', authMasterAdmin, route(Actions.fetchOneOnboardingCategory, [id]))

  app.patch('/onboarding-categories/:id', authMasterAdmin, route(Actions.updateOnboardingCategory, [id, files, payloadValidate(Validation.updateOnboardingCategory)]))
  app.patch('/onboarding-categories/:id/reorder/:direction', authMasterAdmin, route(Actions.reorderOnboardingCategories, [id, customParam('direction')]))

  app.delete('/onboarding-categories/:id', authMasterAdmin, route(Actions.deleteOnboardingCategory, [id]))
}
