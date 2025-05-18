import { findByName } from '../../app-settings/app-settings-repository'
import { SHARE_WITH_COMMUNITY_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(SHARE_WITH_COMMUNITY_LINK)
  return setting.value
}
