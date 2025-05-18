import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { S3_PREFIX_COURSE_CALENDAR } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { patchCalendarImageUrl } from '../course-end-dates-service'

const uploadImageToS3 = async image => {
  if (!image) return undefined

  return uploadFile(image.data, image.mimetype, S3_PREFIX_COURSE_CALENDAR, true)
}

export default async (id: string, files) => {
  const calendarImageKey = await uploadImageToS3(files.calendar_image)

  return patchCalendarImageUrl(id, generateStaticUrl(calendarImageKey))
}
