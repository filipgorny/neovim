import { calculateOilLevel } from '../../services/completion-meter/oil-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Calculating oil level for all active student courses')

    await calculateOilLevel()

    console.log('Done')

    process.exit(0)
  }
)()
