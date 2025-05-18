import { adjustTimeZone } from '../adjust-time-zone'

describe('adjust-time-zone', () => {
  it.skip('returns moment object without TZ changed', () => {
    const student = { use_default_timezone: true }
    const input = 'Mon 10:00'
    const expected = 'Mon 10:00'

    const result = adjustTimeZone(input, student)

    expect(result.format('ddd HH:mm')).toEqual(expected)
  })

  it.skip('returns moment object with TZ adjusted', () => {
    const student = { use_default_timezone: false, timezone: 'Europe/Warsaw' }
    const input = 'Mon 10:00'
    const expected = 'Mon 16:00'

    const result = adjustTimeZone(input, student)

    expect(result.format('ddd HH:mm')).toEqual(expected)
  })
})
