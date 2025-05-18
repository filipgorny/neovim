// eslint-disable-next-line @typescript-eslint/no-var-requires
import { calculatePercentileRank } from '../../services/percentile-rank/calculate-sections-percentile-rank'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Calculating percentile rank for all exam types')

    await calculatePercentileRank()

    console.log('Done.')

    return Promise.resolve()
  }
)()
