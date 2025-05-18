import { patchWhereName } from '../../app-settings/app-settings-repository'
import { TRAINING_TUTORIALS_LINK } from '../support-tab-app-settings-names-enum'
import { Payload } from './set-contact-us-link'

export default async (payload: Payload) => (
  patchWhereName(TRAINING_TUTORIALS_LINK, { value: payload.link })
)
