import moment from 'moment'
import { scheduleCalendarEvents } from '../schedule-events-coles-algorithm'
import { flattenAndDivideEventSchedule } from '../../../src/modules/student-calendar-events/utils/flatten-and-divide-event-schedule'
import { DATE_FORMAT_YMD } from '../../../src/constants'

describe('schedule-events-coles-algorithm', () => {
  it('generates calendar to be filled with events', () => {
    const schedule = scheduleCalendarEvents({
      startDate: moment.utc('2024-07-21'),
      endDate: moment.utc('2024-08-06'),
      prioridays: [7, 1, 2, 3, 4, 0, 6],
      numTasks: 6,
      numTests: 2,
    })

    expect(schedule).toHaveLength(16)
    expect(schedule[0].tasks).toEqual([])
    expect(schedule[1].tasks).toHaveLength(1)
    expect(schedule[1].tasks[0].type).toBe('task')

    const [exams, tasks] = flattenAndDivideEventSchedule(schedule)

    expect(exams).toHaveLength(2)
    expect(tasks).toHaveLength(6)

    expect(exams[0].date).toBeInstanceOf(moment)
    expect(exams[0].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-27')
    expect(exams[1].date.format(DATE_FORMAT_YMD)).toEqual('2024-08-03')

    expect(tasks[0].date).toBeInstanceOf(moment)
    expect(tasks[0].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-22')
    expect(tasks[5].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-31')
  })

  it('generates calendar to be filled with events (another scenariu)', () => {
    const schedule = scheduleCalendarEvents({
      startDate: moment.utc('2024-07-21'),
      endDate: moment.utc('2024-08-06'),
      prioridays: [6, 2, 1, 4, 3, 5, 7],
      numTasks: 10,
      numTests: 3,
    })

    expect(schedule).toHaveLength(16)
    expect(schedule[0].tasks).toHaveLength(1)
    expect(schedule[1].tasks).toHaveLength(1)
    expect(schedule[1].tasks[0].type).toBe('task')

    const [exams, tasks] = flattenAndDivideEventSchedule(schedule)

    expect(exams).toHaveLength(3)
    expect(tasks).toHaveLength(10)

    expect(exams[0].date).toBeInstanceOf(moment)
    expect(exams[0].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-21')
    expect(exams[1].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-28')

    expect(tasks[0].date).toBeInstanceOf(moment)
    expect(tasks[0].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-22')
    expect(tasks[5].date.format(DATE_FORMAT_YMD)).toEqual('2024-07-29')
  })
})
