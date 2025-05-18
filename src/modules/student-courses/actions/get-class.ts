import * as R from 'ramda'
import { findOneOrFail } from '../student-course-repository'
import { findOneOrFail as findStudentOrFail } from '../../students/student-repository'
import moment from 'moment-timezone'
import { addWeekdayFromClassDate } from '../../../../services/weekday/weekday-transformer'
import { convertTimeZone } from '../../group-tutoring-days/actions/fetch-all-days'
import { DATETIME_DATABASE_FORMAT, TIME_ZONE } from '../../../constants'

const DAYS_7 = 7

export const rejectPastDays = R.reject(
  day => moment.tz(`${moment(day.class_date).format('YYYY-MM-DD')} ${day.class_time_end}`, DATETIME_DATABASE_FORMAT, TIME_ZONE).isBefore(moment())
)

const rejectFutureDays = future_date => R.reject(
  R.propSatisfies(class_date => class_date >= future_date, 'class_date')
)

const sortByDatesAndHours = R.sortWith([
  R.ascend(R.prop('class_date')),
  R.ascend(R.prop('class_time')),
])

export default async (student_id, id: string) => {
  const studentCourse = await findOneOrFail({ id, student_id }, ['endDate.days'])
  const student = await findStudentOrFail({ id: student_id })

  return R.pipe(
    R.prop('endDate'),
    R.over(
      R.lensProp('days'),
      R.pipe(
        rejectPastDays,
        rejectFutureDays(moment().startOf('day').add(DAYS_7, 'days')),
        sortByDatesAndHours,
        R.map(convertTimeZone(student))
      )
    )
  )(studentCourse)
}
