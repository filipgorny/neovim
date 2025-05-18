import { convertUsaDate } from '../convert-usa-date'

describe('convert-usa-date', () => {
  it('should convert USA date to ISO date (no time)', () => {
    const usaDate = '12/25/2020'
    const isoDate = '2020-12-25'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should convert USA date to ISO date (with time)', () => {
    const usaDate = '12/25/2020 05:12:00'
    const isoDate = '2020-12-25'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should convert USA date to ISO date (with time, AM/PM)', () => {
    const usaDate = '12/25/2020 05:12:00 AM'
    const isoDate = '2020-12-25'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should convert USA date to ISO date (days without leading zeros)', () => {
    const usaDate = '12/5/2020 05:12:00 AM'
    const isoDate = '2020-12-05'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should convert USA date to ISO date (months without leading zeros)', () => {
    const usaDate = '2/25/2020 05:12:00 AM'
    const isoDate = '2020-02-25'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should convert USA date to ISO date (both without leading zeros)', () => {
    const usaDate = '2/5/2020 05:12:00 AM'
    const isoDate = '2020-02-05'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should ignore ISO date', () => {
    const usaDate = '2020-02-05'
    const isoDate = '2020-02-05'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should ignore ISO date (regardless of time)', () => {
    const usaDate = '2020-02-05 12:23:45'
    const isoDate = '2020-02-05 12:23:45'

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })

  it('should ignore empty input', () => {
    const usaDate = null
    const isoDate = null

    expect(convertUsaDate(usaDate)).toBe(isoDate)
  })
})
