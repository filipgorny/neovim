import { patchWhereName } from '../../app-settings/app-settings-repository'
import { GETTING_STARTED_LINK } from '../support-tab-app-settings-names-enum'
import { Payload } from './set-contact-us-link'

export default async (payload: Payload) => (
  patchWhereName(GETTING_STARTED_LINK, { value: payload.link })
)
