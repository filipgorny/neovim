import moment from 'moment'
import { markEndDatesPresentInCalendar } from '../mark-course-end-date-days-present-in-calendar'

describe('mark-course-end-date-days-present-in-calendar', () => {
  it('transforms live class events so they can be embedded in course end dates to provide additional details', async () => {
    const dt1 = moment().add(1, 'day').toISOString()

    const endDates = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
          },
        ],
      },
    ]

    const endDateDaysPresentInCalendar = {}

    const expected = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
        ],
      },
    ]

    const result = markEndDatesPresentInCalendar(endDateDaysPresentInCalendar)(endDates)

    expect(result).toEqual(expected)
  })

  it('removes live class events from the list', async () => {
    const dt1 = moment().add(1, 'day').toISOString()

    const endDates = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
          },
          {
            id: 'bar',
            class_date: dt1,
          },
          {
            id: 'baz',
            class_date: dt1,
          },
        ],
      },
    ]

    const endDateDaysPresentInCalendar = {
      bar: {
        id: 'bar-123',
        type: 'live_class',
      },
    }

    const expected = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
          {
            id: 'baz',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
        ],
      },
    ]

    const result = markEndDatesPresentInCalendar(endDateDaysPresentInCalendar)(endDates)

    expect(result).toEqual(expected)
  })

  it('marks custom live class events as present in calendar', async () => {
    const dt1 = moment().add(1, 'day').toISOString()

    const endDates = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
          },
          {
            id: 'bar',
            class_date: dt1,
          },
          {
            id: 'baz',
            class_date: dt1,
          },
          {
            id: 'efg',
            class_date: dt1,
          },
        ],
      },
    ]

    const endDateDaysPresentInCalendar = {
      bar: {
        id: 'bar-123',
        type: 'live_class',
      },
      baz: {
        id: 'baz-123',
        type: 'custom_live_class',
      },
    }

    const expected = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
          {
            id: 'baz',
            class_date: dt1,
            present_in_calendar: true,
            student_calendar_event_id: 'baz-123',
          },
          {
            id: 'efg',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
        ],
      },
    ]

    const result = markEndDatesPresentInCalendar(endDateDaysPresentInCalendar)(endDates)

    expect(result).toEqual(expected)
  })

  it('removes past days from list', async () => {
    const dt1 = moment().add(1, 'day').toISOString()
    const dt2 = moment().subtract(1, 'day').toISOString()

    const endDates = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
          },
          {
            id: 'bar',
            class_date: dt1,
          },
          {
            id: 'baz',
            class_date: dt2,
          },
          {
            id: 'efg',
            class_date: dt2,
          },
        ],
      },
    ]

    const endDateDaysPresentInCalendar = {
      bar: {
        id: 'bar-123',
        type: 'live_class',
      },
      baz: {
        id: 'baz-123',
        type: 'custom_live_class',
      },
    }

    const expected = [
      {
        days: [
          {
            id: 'foo',
            class_date: dt1,
            present_in_calendar: false,
            student_calendar_event_id: undefined,
          },
        ],
      },
    ]

    const result = markEndDatesPresentInCalendar(endDateDaysPresentInCalendar)(endDates)

    expect(result).toEqual(expected)
  })
})
