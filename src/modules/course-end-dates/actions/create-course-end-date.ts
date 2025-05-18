import { createCourseEndDate } from '../course-end-dates-service'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_COURSE_CALENDAR } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import moment from 'moment'
import { customException, throwException } from '@desmart/js-utils'

type Payload = {
  course_id: string
  start_date: string
  end_date: string
  calendar_image?: any
  meeting_url?: string
  semester_name?: string
}

const uploadImageToS3 = async image => {
  if (!image) return undefined

  return uploadFile(image.data, image.mimetype, S3_PREFIX_COURSE_CALENDAR, true)
}

const validateDates = (payload: Payload) => {
  const startDate = moment(payload.start_date)
  const endDate = moment(payload.end_date)

  if (startDate.isAfter(endDate)) {
    throwException(customException('course_end_date.dates-invalid', 422, 'Start date cannot be after end date'))
  }
}

export default async (payload: Payload, files) => {
  validateDates(payload)

  let calendarImageKey

  if (files?.calendar_image) {
    calendarImageKey = await uploadImageToS3(files.calendar_image)
  }

  const calendarUrl = calendarImageKey ? generateStaticUrl(calendarImageKey) : undefined

  return createCourseEndDate(payload.course_id, payload.start_date, payload.end_date, calendarUrl, payload.meeting_url, payload.semester_name)
}
