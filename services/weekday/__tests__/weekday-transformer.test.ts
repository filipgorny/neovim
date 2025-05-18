import { addWeekdayFromClassDate } from '../weekday-transformer'

describe('weekday-transformer', () => {
  it('adds weekday to a single item', () => {
    const item = {
      foo: 'bar',
      class_date: '2023-09-05',
    }

    const expected = {
      foo: 'bar',
      class_date: '2023-09-05',
      weekday: 'Tue',
    }

    const result = addWeekdayFromClassDate(item)

    expect(result).toEqual(expected)
  })

  it('adds weekday to an array', () => {
    const collection = [
      {
        foo: 'bar',
        class_date: '2023-09-05',
      },
      {
        foo: 'qux',
        class_date: '2023-09-07',
      },
    ]

    const expected = [
      {
        foo: 'bar',
        class_date: '2023-09-05',
        weekday: 'Tue',
      },
      {
        foo: 'qux',
        class_date: '2023-09-07',
        weekday: 'Thu',
      },
    ]

    const result = addWeekdayFromClassDate(collection)

    expect(result).toEqual(expected)
  })

  it('adds null weekday when class_date is empty', () => {
    const collection = [
      {
        foo: 'bar',
        class_date: null,
      },
      {
        foo: 'qux',
        class_date: '2023-09-07',
      },
    ]

    const expected = [
      {
        foo: 'bar',
        class_date: null,
        weekday: null,
      },
      {
        foo: 'qux',
        class_date: '2023-09-07',
        weekday: 'Thu',
      },
    ]

    const result = addWeekdayFromClassDate(collection)

    expect(result).toEqual(expected)
  })
})
