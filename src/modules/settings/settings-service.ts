import fs from 'fs/promises'
import path from 'path'
import template from './settings-template.json'
import { Settings } from './settings'

export const __basedir = path.resolve('__dirname/..')

const saveSettingsToFile = async payload => (
  fs.writeFile(`${__basedir}/storage/settings.json`, JSON.stringify(payload))
)

export const getSettings = async () => {
  try {
    const settings = await fs.readFile(`${__basedir}/storage/settings.json`, { encoding: 'utf-8' })

    return JSON.parse(settings)
  } catch (e) {
    await saveSettingsToFile(template)

    return template
  }
}

export const getSetting = async (name: Settings, defaultTo = 0) => {
  const settings = await getSettings()

  return (settings[name] ? settings[name] : defaultTo) as number
}
