import { Settings } from '../settings'

export const getSettings = () => ({
  defaultExamAccessPeriod: 14,
  examAmountThreshold: 5,
  minimumExamsTakenForShowingScores: 20,
  saltyBucksStartingBalance: 500,
})

export const getSetting = (name: Settings, defaultTo: any = 0) => {
  const settings = getSettings()

  return settings[name] ? settings[name] : defaultTo
}
