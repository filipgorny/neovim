import moment from 'moment'
import { flattenAndDivideEventSchedule } from '../flatten-and-divide-event-schedule'
import { scheduleCalendarEvents } from '../../../../../services/student-calendar-events/schedule-events-coles-algorithm'

describe('flatten-and-divide-event-schedule', () => {
  it('extracts tasks and exams from schedule', () => {
    const schedule = scheduleCalendarEvents({
      startDate: moment('2024-07-21'),
      endDate: moment('2024-08-06'),
      prioridays: [7, 1, 2, 3, 4, 0, 6],
      numTasks: 6,
      numTests: 2,
    })

    const [exams, tasks] = flattenAndDivideEventSchedule(schedule)

    expect(exams).toHaveLength(2)
    expect(exams[0].type).toBe('exam')
    expect(exams[1].label).toBe('Test 2')

    expect(tasks).toHaveLength(6)
    expect(tasks[2].type).toBe('task')
    expect(tasks[4].label).toBe('Task 5')
  })
})
