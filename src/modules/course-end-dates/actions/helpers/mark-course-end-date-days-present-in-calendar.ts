import moment from 'moment'
import * as R from 'ramda'

export const markEndDatesPresentInCalendar = (courseEndDateDayIds, studentCourse?) => data => {
  const today = moment().hours(0).minutes(0).seconds(0).milliseconds(0).valueOf()

  return R.map(
    course => (
      R.over(
        R.lensProp('days'),
        R.pipe(
          R.map(
            day => {
              // if there is no student course, we don't need to check for live class events or remove anything (this route is also used for admins)
              if (!studentCourse) {
                return day
              }

              const dateToCheck = moment(day.class_date).valueOf()

              if (R.gt(today)(dateToCheck)) {
                return null // remove past dates
              }

              if (courseEndDateDayIds[day.id] && courseEndDateDayIds[day.id].type === 'live_class') {
                return null // remove live class event from list
              }

              return {
                ...day,
                student_calendar_event_id: courseEndDateDayIds[day.id]?.id,
                present_in_calendar: !!courseEndDateDayIds[day.id]?.type,
              }
            }
          ),
          R.filter(R.identity) // remove null values
        )
      )(course)
    )
  )(data)
}
