import { findByName } from '../../app-settings/app-settings-repository'
import { CONTACT_US_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(CONTACT_US_LINK)
  return setting.value
}
