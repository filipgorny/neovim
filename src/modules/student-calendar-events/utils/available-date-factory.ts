import moment, { Moment } from 'moment'
import { DATE_FORMAT_YMD } from '../../../constants'

function dateToString (date) {
  return date.toISOString().split('T')[0]
}

export class AvailableDateFactory {
  maxEventsCounter = 0
  dates = {}
  instance?: AvailableDateFactory = undefined
  startDate?: Date = undefined
  endDate?: Date = undefined
  hasBeenCalled: Boolean = false

  constructor (startDateString, endDateString) {
    this.startDate = new Date(startDateString)
    this.endDate = new Date(endDateString)

    this.initializeDates()
  }

  initializeDates () {
    this.dates = {}

    const currentDate: Date = new Date(this.startDate)

    while (currentDate < this.endDate) {
      this.dates[dateToString(new Date(currentDate))] = 0

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(this.dates)
  }

  addEventToDate (date: Moment) {
    this.dates[date.format(DATE_FORMAT_YMD)]++

    return this
  }

  getAvailableDate () {
    this.hasBeenCalled = true

    const currentDate = new Date(this.endDate)

    console.log('getAvailableDate called', this.maxEventsCounter)

    while (currentDate >= this.startDate) {
      const dateEventCount = this.dates[dateToString(new Date(currentDate))]

      if (dateEventCount <= this.maxEventsCounter) {
        console.log(dateToString(new Date(currentDate)))

        return moment(new Date(currentDate))
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    this.maxEventsCounter++

    return this.getAvailableDate()
  }

  wasCalled () {
    return this.hasBeenCalled
  }
}
