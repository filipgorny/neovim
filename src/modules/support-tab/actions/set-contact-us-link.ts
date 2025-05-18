import { patchWhereName } from '../../app-settings/app-settings-repository'
import { CONTACT_US_LINK } from '../support-tab-app-settings-names-enum'

export type Payload = {
  link: string
}

export default async (payload: Payload) => (
  patchWhereName(CONTACT_US_LINK, { value: payload.link })
)
