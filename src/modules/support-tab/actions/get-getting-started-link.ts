import { findByName } from '../../app-settings/app-settings-repository'
import { GETTING_STARTED_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(GETTING_STARTED_LINK)
  return setting.value
}
