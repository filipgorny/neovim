import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../services/vimeo/get-vimeo-static-link'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { fileSchema } from '../validation/schema/create-video-schema'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import { createVideo } from '../video-service'
import { FileArray, UploadedFile } from 'express-fileupload'
import validateVideoTitle from '../validation/validate-video-title'
import { VideoCategories } from '../video-categories'
import { customException, throwException } from '@desmart/js-utils'

export interface CreateVideoPayload {
  title: string
  description: string
  source: string
  category?: string
  course_end_date_id?: string
  source_no_bg_music?: string
  course_id?: string
}

const validateCourseEndDate = (payload: CreateVideoPayload) => {
  if (payload.category === VideoCategories.recordings && !payload.course_end_date_id) {
    throwException(customException('videos.course_end_date_id_required', 403, 'Course end date id is required for recordings category'))
  }
}

const prepareAndSaveVideo = (files: FileArray | undefined) => async (payload: CreateVideoPayload) => {
  const image = files?.image as UploadedFile

  if (image) {
    validateFilesPayload(fileSchema)(files)

    validateFileMimeType(image.mimetype)
  }

  await validateVideoTitle(payload.title)
  validateCourseEndDate(payload)

  return await createVideo({ image, payload })
}

export default async (files: FileArray | undefined, payload: CreateVideoPayload) => (
  R.pipeWith(R.andThen)([
    prepareAndSaveVideo(files),
    R.invoker(0, 'toJSON'),
    R.evolve({
      thumbnail: value => value ? generateStaticUrl(value) : null,
      source: value => value ? getVimeoStaticLink(value) : null,
    }),
  ])(payload)
)
