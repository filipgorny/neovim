import { patchWhereName } from '../../app-settings/app-settings-repository'
import { HELP_CENTER_LINK } from '../support-tab-app-settings-names-enum'
import { Payload } from './set-contact-us-link'

export default async (payload: Payload) => (
  patchWhereName(HELP_CENTER_LINK, { value: payload.link })
)
