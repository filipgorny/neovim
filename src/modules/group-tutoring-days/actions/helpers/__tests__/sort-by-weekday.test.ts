import { sortByWeekDays } from '../sort-by-weekday'

describe('sort-by-weekday', () => {
  it('sorts an array in a proper way', () => {
    const input = [
      { weekday: 'Tue' },
      { weekday: 'Mon' },
      { weekday: 'Sun' },
      { weekday: 'Wed' },
      { weekday: 'Fri' },
      { weekday: 'Thu' },
    ]

    const expected = [
      { weekday: 'Mon' },
      { weekday: 'Tue' },
      { weekday: 'Wed' },
      { weekday: 'Thu' },
      { weekday: 'Fri' },
      { weekday: 'Sun' },
    ]

    const result = sortByWeekDays(input)

    expect(result).toEqual(expected)
  })
})
