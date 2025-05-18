import * as R from 'ramda'

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const appendEmptyWeekday = obj => R.always({ ...obj, weekday: null })

const extractAndAppendWeekday = obj => R.pipe(
  (dateString: string): Date => new Date(dateString),
  (date: Date): number => date.getDay(),
  (weekdayOrder: number): string => WeekDays[weekdayOrder],
  (weekday: string): {} => ({ ...obj, weekday })
)

const addWeekday = obj => (
  R.pipe(
    R.prop('class_date'),
    R.ifElse(
      R.isNil,
      appendEmptyWeekday(obj),
      extractAndAppendWeekday(obj)
    )
  )(obj)
)

export const addWeekdayFromClassDate = data => Array.isArray(data) ? R.map(addWeekday)(data) : addWeekday(data)
