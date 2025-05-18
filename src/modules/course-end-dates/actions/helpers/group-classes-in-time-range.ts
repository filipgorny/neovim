import moment from 'moment'

export const groupClassesInTimeRange = (existingDays: any[], dateStart: string, dateEnd: string) => {
  // Create array of all dates with empty classes arrays
  const result = []
  const currentDate = moment(dateStart)
  const endDate = moment(dateEnd)

  while (currentDate.isSameOrBefore(endDate)) {
    const date = currentDate.format('YYYY-MM-DD')
    result.push({
      date,
      classes: existingDays.filter(day => moment(day.class_date).format('YYYY-MM-DD') === date),
    })
    currentDate.add(1, 'day')
  }

  return result
}
