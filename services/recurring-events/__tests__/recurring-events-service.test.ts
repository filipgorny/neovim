import { TIME_ZONE } from '../../../src/constants'
import { RecurringEventDefinition, getRecurringEventNextDispatchTime, shouldDispatchRecurringNotification } from '../recurring-events-service'
import moment from 'moment-timezone'

const recurringEventDefinitions: RecurringEventDefinition[] = [
  {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    time: '13:50',
  },
  {
    days: ['Tue'],
    time: '13:50',
  },
  {
    days: ['Mon', 'Fri'],
    time: '13:50',
  },
  {
    days: ['Mon', 'Tue'],
    time: '14:50',
  },
]

const now = moment.tz('2023-04-25 13:50:00.000', TIME_ZONE).toDate() // Tuesday

describe('recurring-events', () => {
  describe('shouldDispatchRecurringNotification', () => {
    it('should return true when conditions are met', () => {
      expect(shouldDispatchRecurringNotification(recurringEventDefinitions[0], now)).toEqual(true)
      expect(shouldDispatchRecurringNotification(recurringEventDefinitions[1], now)).toEqual(true)
    })

    it('should return false when conditions are not met', () => {
      expect(shouldDispatchRecurringNotification(recurringEventDefinitions[2], now)).toEqual(false)
      expect(shouldDispatchRecurringNotification(recurringEventDefinitions[3], now)).toEqual(false)
    })
  })

  describe('getRecurringEventNextDispatchTime', () => {
    it('should dispatch now (next time)', () => {
      expect(getRecurringEventNextDispatchTime(recurringEventDefinitions[0], now)).toEqual(moment.tz('2023-04-26 13:50:00.000', TIME_ZONE).toDate())
    })

    it('should dispatch exactly in a week', () => {
      expect(getRecurringEventNextDispatchTime(recurringEventDefinitions[1], now)).toEqual(moment.tz('2023-05-02 13:50:00.000', TIME_ZONE).toDate())
    })

    it('should dispatch today', () => {
      expect(getRecurringEventNextDispatchTime(recurringEventDefinitions[3], now)).toEqual(moment.tz('2023-04-25 14:50:00.000', TIME_ZONE).toDate())
    })

    it('should dispatch this week', () => {
      expect(getRecurringEventNextDispatchTime(recurringEventDefinitions[2], now)).toEqual(moment.tz('2023-04-28 13:50:00.000', TIME_ZONE).toDate())
    })
  })
})
