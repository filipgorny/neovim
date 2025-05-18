import * as R from 'ramda'
import { updateAppSetting } from '../../app-settings/app-settings-service'
import { findByName as findSettingByName } from '../../app-settings/app-settings-repository'

export const ENABLE_2FA_SETTING = 'enable_2fa'

export default async () => {
  const setting = await findSettingByName(ENABLE_2FA_SETTING)

  const updatedSetting = R.pipe(
    R.omit(['id']),
    R.set(
      R.lensProp('value'),
      '1'
    )
  )(setting)

  await updateAppSetting(setting.id, updatedSetting)
}
