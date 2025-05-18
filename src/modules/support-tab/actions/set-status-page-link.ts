import { patchWhereName } from '../../app-settings/app-settings-repository'
import { STATUS_PAGE_LINK } from '../support-tab-app-settings-names-enum'
import { Payload } from './set-contact-us-link'

export default async (payload: Payload) => (
  patchWhereName(STATUS_PAGE_LINK, { value: payload.link })
)
