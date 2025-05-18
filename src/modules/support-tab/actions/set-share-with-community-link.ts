import { patchWhereName } from '../../app-settings/app-settings-repository'
import { SHARE_WITH_COMMUNITY_LINK } from '../support-tab-app-settings-names-enum'
import { Payload } from './set-contact-us-link'

export default async (payload: Payload) => (
  patchWhereName(SHARE_WITH_COMMUNITY_LINK, { value: payload.link })
)
