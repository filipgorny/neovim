import moment from 'moment'
import { buildTheSchedule } from '../build-the-schedule'

describe('build-the-schedule', () => {
  it('builds the schedule for the calendar', () => {
    const result = buildTheSchedule(moment('2024-01-01'), moment('2024-01-10'))

    expect(result).toHaveLength(9)
    expect(result[0].dayOfWeek).toEqual(2)
    expect(result[0].onBreak).toEqual(false)
    expect(result[0].tasks).toEqual([])
  })
})
