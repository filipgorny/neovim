import R from 'ramda'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { fileSchema } from '../validation/schema/update-video-schema'
import { findOneOrFail, patch } from '../video-repository'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_VIDEOS } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../services/vimeo/get-vimeo-static-link'
import extractVimeoSourceId from '../../../../services/vimeo/extract-vimeo-source-id'
import fetchVimeoDetails from '../../../../services/vimeo/fetch-details'
import { CreateVideoPayload } from './create-video'
import validateVideoTitle from '../validation/validate-video-title'
import { FileArray, UploadedFile } from 'express-fileupload'
import { VideoCategories } from '../video-categories'

interface UpdateVideoPayload extends Partial<CreateVideoPayload> { image: null | 'null' }

interface ValidateVideoTitleIfNeededCommand { newTitle: string, currentTitle: string }

const uploadFileToS3AndGetKey = async (oldKey, image) => {
  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_VIDEOS, true)

  return key
}

const validateVideoTitleIfNeeded = async (command: ValidateVideoTitleIfNeededCommand) => {
  if (command.newTitle && command.newTitle !== command.currentTitle) {
    await validateVideoTitle(command.newTitle)
  }
}

const prepareAndSaveResource = (id: string, files: FileArray) => async (payload: UpdateVideoPayload) => {
  const video = await findOneOrFail({ id })
  const shouldReuploadFile = Boolean(files)
  const shouldUpdateSource = Boolean(payload.source)
  const shouldUpdateSourceNoBgMusic = Boolean(payload.source_no_bg_music) || payload.source_no_bg_music === '' // we allow to set to empty string to remove source_no_bg_music
  const preparedFiles = { thumbnail: undefined }
  const preparedSource = {
    source: undefined,
    source_no_bg_music: undefined,
    duration: undefined,
  }

  await validateVideoTitleIfNeeded({ newTitle: payload.title, currentTitle: video.title })

  if (shouldUpdateSource) {
    const sourceId = extractVimeoSourceId(payload.source)
    const vimeoDetails = await fetchVimeoDetails(sourceId)

    preparedSource.source = sourceId
    preparedSource.duration = vimeoDetails.duration
  }

  if (shouldUpdateSourceNoBgMusic) {
    let sourceIdNoBgMusic

    // If source_no_bg_music is empty string, we set it to null
    try {
      sourceIdNoBgMusic = extractVimeoSourceId(payload.source_no_bg_music)
    } catch (e) {
      sourceIdNoBgMusic = null
    }

    preparedSource.source_no_bg_music = sourceIdNoBgMusic
  }

  if (shouldReuploadFile) {
    validateFilesPayload(fileSchema)(files)

    const image = files?.image as UploadedFile

    validateFileMimeType(image.mimetype)

    preparedFiles.thumbnail = await uploadFileToS3AndGetKey(video.thumbnail, image)
  }

  if (payload.image === null || payload.image === 'null') {
    preparedFiles.thumbnail = null
    payload.image = undefined
  }

  return patch(video.id, {
    ...payload,
    ...preparedFiles,
    ...preparedSource,
  })
}

export default async (id, files, payload) => (
  R.pipeWith(R.andThen)([
    prepareAndSaveResource(id, files),
    R.invoker(0, 'toJSON'),
    R.evolve({
      thumbnail: value => value ? generateStaticUrl(value) : null,
      source: value => value ? getVimeoStaticLink(value) : null,
      source_no_bg_music: value => value ? getVimeoStaticLink(value) : null,
    }),
  ])(payload)
)
