import { customException, throwException } from '@desmart/js-utils'
import moment from 'moment'
import { findOneOrFail } from '../course-end-dates-repository'
import { patchEndDate } from '../course-end-dates-service'

type Payload = {
  end_date: string
}

const validateDates = async (id: string, payload: Payload) => {
  const courseEndDate = await findOneOrFail({ id })

  const startDate = moment(courseEndDate.start_date)
  const endDate = moment(payload.end_date)

  if (startDate.isAfter(endDate)) {
    throwException(customException('course_end_date.dates-invalid', 422, 'Start date cannot be after end date'))
  }
}

export default async (id: string, payload: Payload) => {
  await validateDates(id, payload)

  return patchEndDate(id, payload.end_date)
}
