import { calculateMileage } from '../mileage-service'

describe('mileage-service', () => {
  it('calculates the mileage based on given app setting value and book progress', () => {
    const maxMileageAppSettingValue = 10000
    const bookProgress = [
      {
        seen_count: 300,
        total_count: 800,
      },
      {
        seen_count: 550,
        total_count: 1275,
      },
    ]
    const expected = 4096

    /**
     * How it should work:
     * ((300 + 550) / (800 + 1275)) * 10000 = 4096
     */
    const result = calculateMileage(maxMileageAppSettingValue)(bookProgress)

    expect(result).toEqual(expected)
  })
})
