import fs from 'fs'
import R from 'ramda'
import { __basedir } from '../../../server'
import * as template from '../settings-template.json'

/**
 * For some reason __basedir is not available during application start-up (it's undefined)
 */
let SETTINGS_FILE_PATH

const touchFile = () => {
  const now = new Date()

  try {
    fs.utimesSync(SETTINGS_FILE_PATH, now, now)
  } catch (err) {
    fs.closeSync(fs.openSync(SETTINGS_FILE_PATH, 'w'))
  }
}

const saveSettingsToFile = async payload => {
  touchFile()

  return fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(payload))
}

export default async payload => {
  let settings

  SETTINGS_FILE_PATH = `${__basedir}/storage/settings.json`

  try {
    settings = require('../../../../storage/settings')
  } catch (e) {
    settings = template
  }

  await R.pipe(
    R.mergeRight(settings),
    saveSettingsToFile
  )(payload)

  return true
}
