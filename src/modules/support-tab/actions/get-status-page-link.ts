import { findByName } from '../../app-settings/app-settings-repository'
import { STATUS_PAGE_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(STATUS_PAGE_LINK)
  return setting.value
}
