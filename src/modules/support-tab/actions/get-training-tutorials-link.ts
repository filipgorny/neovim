import { findByName } from '../../app-settings/app-settings-repository'
import { TRAINING_TUTORIALS_LINK } from '../support-tab-app-settings-names-enum'

export default async () => {
  const setting = await findByName(TRAINING_TUTORIALS_LINK)
  return setting.value
}
