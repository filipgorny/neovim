import moment from 'moment'
import { groupClassesInTimeRange } from '../group-classes-in-time-range'

describe('groupClassesInTimeRange', () => {
  const mockClasses = [
    { class_date: '2023-05-01T10:00:00Z', id: 1 },
    { class_date: '2023-05-02T14:00:00Z', id: 2 },
    { class_date: '2023-05-03T09:00:00Z', id: 3 },
    { class_date: '2023-05-03T16:00:00Z', id: 4 },
  ]

  it('should group classes correctly within the given date range', () => {
    const result = groupClassesInTimeRange(mockClasses, '2023-05-01', '2023-05-03')

    expect(result).toHaveLength(3)
    expect(result[0].date).toBe('2023-05-01')
    expect(result[0].classes).toHaveLength(1)
    expect(result[0].classes[0].id).toBe(1)

    expect(result[1].date).toBe('2023-05-02')
    expect(result[1].classes).toHaveLength(1)
    expect(result[1].classes[0].id).toBe(2)

    expect(result[2].date).toBe('2023-05-03')
    expect(result[2].classes).toHaveLength(2)
    expect(result[2].classes[0].id).toBe(3)
    expect(result[2].classes[1].id).toBe(4)
  })

  it('should handle empty input array', () => {
    const result = groupClassesInTimeRange([], '2023-05-01', '2023-05-03')

    expect(result).toHaveLength(3)
    expect(result.every(day => day.classes.length === 0)).toBe(true)
  })

  it('should handle single day range', () => {
    const result = groupClassesInTimeRange(mockClasses, '2023-05-02', '2023-05-02')

    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2023-05-02')
    expect(result[0].classes).toHaveLength(1)
    expect(result[0].classes[0].id).toBe(2)
  })

  it('should handle date range with no classes', () => {
    const result = groupClassesInTimeRange(mockClasses, '2023-05-04', '2023-05-05')

    expect(result).toHaveLength(2)
    expect(result.every(day => day.classes.length === 0)).toBe(true)
  })

  it('should handle date range spanning multiple months', () => {
    const longRangeClasses = [
      ...mockClasses,
      { class_date: '2023-06-01T10:00:00Z', id: 5 },
    ]
    const result = groupClassesInTimeRange(longRangeClasses, '2023-05-01', '2023-06-01')

    expect(result).toHaveLength(32) // 31 days in May + 1 day in June
    expect(result[0].date).toBe('2023-05-01')
    expect(result[result.length - 1].date).toBe('2023-06-01')
    expect(result[result.length - 1].classes).toHaveLength(1)
    expect(result[result.length - 1].classes[0].id).toBe(5)
  })
})
