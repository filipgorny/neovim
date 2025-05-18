import { findByName } from '../../app-settings/app-settings-repository'
import { CONTACT_US_LINK, GETTING_STARTED_LINK, HELP_CENTER_LINK, SHARE_WITH_COMMUNITY_LINK, STATUS_PAGE_LINK, TRAINING_TUTORIALS_LINK } from '../support-tab-app-settings-names-enum'

export default async () => ({
  [TRAINING_TUTORIALS_LINK]: (await findByName(TRAINING_TUTORIALS_LINK)).value,
  [STATUS_PAGE_LINK]: (await findByName(STATUS_PAGE_LINK)).value,
  [SHARE_WITH_COMMUNITY_LINK]: (await findByName(SHARE_WITH_COMMUNITY_LINK)).value,
  [HELP_CENTER_LINK]: (await findByName(HELP_CENTER_LINK)).value,
  [GETTING_STARTED_LINK]: (await findByName(GETTING_STARTED_LINK)).value,
  [CONTACT_US_LINK]: (await findByName(CONTACT_US_LINK)).value,
})
