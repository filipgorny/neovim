import * as R from 'ramda'
import { shouldChangeOilTemperature } from '../temperature-service-helpers'

describe('temperature-service', () => {
  it('returns true if temperature should be changed along with value to be added', async () => {
    const velocityDifferenceIncrese = 26
    const resultIncrease = await shouldChangeOilTemperature(velocityDifferenceIncrese)

    expect(resultIncrease).toEqual([true, 1])

    const velocityDifferenceDecrese = -26
    const resultDecrese = await shouldChangeOilTemperature(velocityDifferenceDecrese)

    expect(resultDecrese).toEqual([true, -1])
  })

  it('returns false if temperature should not be changed (along with value to be ignored)', async () => {
    const velocityDifferenceIncrese = 25
    const resultIncrease = await shouldChangeOilTemperature(velocityDifferenceIncrese)

    expect(resultIncrease).toEqual([false, 0])

    const velocityDifferenceDecrese = -25
    const resultDecrese = await shouldChangeOilTemperature(velocityDifferenceDecrese)

    expect(resultDecrese).toEqual([false, 0])
  })
})
