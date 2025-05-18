import * as R from 'ramda'
import { updateAppSetting } from '../../app-settings/app-settings-service'
import { findByName as findSettingByName } from '../../app-settings/app-settings-repository'
import { ENABLE_2FA_SETTING } from './enable'

export default async () => {
  const setting = await findSettingByName(ENABLE_2FA_SETTING)

  const updatedSetting = R.pipe(
    R.omit(['id']),
    R.set(
      R.lensProp('value'),
      '0'
    )
  )(setting)

  await updateAppSetting(setting.id, updatedSetting)
}
