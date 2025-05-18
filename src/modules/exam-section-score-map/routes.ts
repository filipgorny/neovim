import { id, payloadValidate } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.patch('/exam-section-score-map/section/:id', route(Actions.updateSectionScoreMap, [id, payloadValidate(Validation.updateSectionScoreMap)]))
}
