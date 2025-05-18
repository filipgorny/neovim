import { updateAppSetting } from '../../app-settings/app-settings-service'
import { findByName as findSettingByName } from '../../app-settings/app-settings-repository'
import { int } from '@desmart/js-utils'

const EMAIL_RESEND_2FA_SETTING = 'enable_email_resend'

export default async () => {
  const setting = await findSettingByName(EMAIL_RESEND_2FA_SETTING)

  return updateAppSetting(setting.id, {
    ...setting,
    value: Math.abs(int(setting.value) - 1).toString(),
  })
}
