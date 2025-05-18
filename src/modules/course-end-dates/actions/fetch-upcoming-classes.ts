import moment from 'moment'
import { findDaysByDateRange } from '../../course-end-date-days/course_end_date_days-repository'
import { groupClassesInTimeRange } from './helpers/group-classes-in-time-range'

export default async (id: string) => {
  const dateStart = moment().format('YYYY-MM-DD')
  const dateEnd = moment().add(6, 'days').format('YYYY-MM-DD')

  const existingDays = await findDaysByDateRange(id, dateStart, dateEnd)

  return groupClassesInTimeRange(existingDays, dateStart, dateEnd)
}
