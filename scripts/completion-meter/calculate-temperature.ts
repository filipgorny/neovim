import { calculateTemperature } from '../../services/completion-meter/temperature-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Calculating temperature for all active student courses')

    await calculateTemperature()

    console.log('Done')

    process.exit(0)
  }
)()
