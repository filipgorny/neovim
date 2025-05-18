import { removeOutdatedAccounts } from '../../services/students/remove-outdated-accounts'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Start removing student accounts that did not log in for the last 90 days')

  await removeOutdatedAccounts()

  console.log('Done')

  process.exit(0)
})()
