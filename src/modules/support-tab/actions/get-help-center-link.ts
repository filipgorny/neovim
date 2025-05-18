import { findByName } from '../../app-settings/app-settings-repository'
import { HELP_CENTER_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(HELP_CENTER_LINK)
  return setting.value
}
