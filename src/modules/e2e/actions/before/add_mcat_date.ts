import moment from 'moment'
import { createMcatDate } from '../../../mcat-dates/mcat-dates-service'
import { findOne } from '../../../mcat-dates/mcat-dates-repository'

type Payload = {
  course_id: string,
  amount_of_days: number,
}

export default async (payload: Payload) => {
  const dto = {
    course_id: payload.course_id,
    mcat_date: moment().add(payload.amount_of_days, 'days').format('YYYY-MM-DD'),
  }

  const mcatDate = await findOne(dto)

  return mcatDate || createMcatDate(dto)
}
