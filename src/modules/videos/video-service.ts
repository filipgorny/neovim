import * as R from 'ramda'
import { create, findOneOrFail, remove, deleteCompletely, findOneOrFailWithDeleted, calculateVideoRating, patch } from './video-repository'
import { S3_PREFIX_VIDEOS } from '../../../services/s3/s3-file-prefixes'
import extractVimeoSourceId from '../../../services/vimeo/extract-vimeo-source-id'
import fetchVimeoDetails from '../../../services/vimeo/fetch-details'
import uploadFile from '../../../services/s3/upload-file'
import { UploadedFile } from 'express-fileupload'
import { CreateVideoPayload } from './actions/create-video'
import mapP from '../../../utils/function/mapp'
import { removeResourceInTrx } from '../book-content-resources/book-content-resource-service'
import { patch as patchResource } from '../book-content-resources/book-content-resource-repository'
import { deleteRecord } from '../student-videos/student-videos-repository'
import db from '../../models'
import asAsync from '../../../utils/function/as-async'
import { DELETED_AT } from '../../../utils/generics/repository'
import env from '../../../utils/env'
import { VideoCategories } from './video-categories'
import forEachP from '../../../utils/function/foreachp'

interface CreateVideoCommand {
  payload: CreateVideoPayload,
  image?: UploadedFile
}

export const createVideo = async ({ image, payload }: CreateVideoCommand) => {
  const sourceId = extractVimeoSourceId(payload.source)
  const sourceIdNoBgMusic = payload.source_no_bg_music ? extractVimeoSourceId(payload.source_no_bg_music) : null

  const { duration } = await fetchVimeoDetails(sourceId)

  const thumbnail = image
    ? await uploadFile(image.data, image.mimetype, S3_PREFIX_VIDEOS, true)
    : null

  return await create({
    thumbnail,
    duration,
    title: payload.title,
    description: payload.description,
    source: sourceId,
    category: payload.category,
    course_end_date_id: payload.course_end_date_id,
    course_id: payload.course_id,
    source_no_bg_music: sourceIdNoBgMusic,
  })
}

export const copyVideoById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFailWithDeleted({ id }),
    copyVideo,
  ])(true)
)

export const copyVideo = async (video) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    R.over(
      R.lensProp('source'),
      R.slice('https://vimeo.com/'.length, Infinity)
    ),
    R.over(
      R.lensProp('thumbnail'),
      R.unless(
        R.isNil,
        R.slice(`https://${env('AWS_S3_BUCKET')}.s3.amazonaws.com/`.length, Infinity)
      )
    ),
    create,
    R.invoker(0, 'toJSON'),
  ])(video)
)

export const copyAndArchiveVideoById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFailWithDeleted({ id }),
    copyAndArchiveVideo,
  ])(true)
)

export const copyAndArchiveVideo = async (video) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    R.set(
      R.lensProp('is_archived'),
      true
    ),
    R.over(
      R.lensProp('source'),
      R.slice('https://vimeo.com/'.length, Infinity)
    ),
    R.over(
      R.lensProp('thumbnail'),
      R.unless(
        R.isNil,
        R.slice(`https://${env('AWS_S3_BUCKET')}.s3.amazonaws.com/`.length, Infinity)
      )
    ),
    create,
    R.invoker(0, 'toJSON'),
  ])(video)
)

export const splitVideoById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFailWithDeleted({ id }, ['resources.content.subchapter.chapter.book']),
    splitVideo,
  ])(true)
)

export const splitVideo = async (video) => (
  R.pipeWith(R.andThen)([
    asAsync(R.prop('resources')),
    mapP(
      async (resource) => {
        const book = R.path(['content', 'subchapter', 'chapter', 'book'], resource)
        let newVideo

        if (R.prop('is_archived', book) || R.prop(DELETED_AT, book)) {
          newVideo = await copyAndArchiveVideoById(video.id)
        } else {
          newVideo = await copyVideoById(video.id)
        }

        await patchResource(resource.id, { external_id: newVideo.id })

        return newVideo
      }
    ),
    async (videos) => {
      if (videos.length > 0 && (!R.all(R.prop('is_archived'))(videos) || (R.all(R.prop('is_archived'))(videos) && R.prop('is_archived')(video)))) {
        await deleteCompletely(video.id)
      }
    },
  ])(video)
)

export const removeVideo = async (id: string) => {
  const video = await findOneOrFail({ id }, ['resources', 'studentVideos'])
  const defaultThumbnail = S3_PREFIX_VIDEOS + '/not-found.png'

  await db.bookshelf.transaction(
    async trx => {
      await mapP(
        async resource => removeResourceInTrx(resource, trx)
      )(video.resources)

      await remove(video.id, defaultThumbnail, trx)

      // await forEachP(deleteRecord)(R.pluck('id', video.studentVideos))
    }
  )

  return true
}

export const recalculateVideoRating = async (id: string) => {
  const rating = await calculateVideoRating(id)

  return patch(id, { rating })
}

export const setFakeRating = async (id: string, fake_rating: number) => (
  patch(id, { fake_rating })
)

export const toggleFakeRating = async (id: string, use_fake_rating: boolean) => (
  patch(id, { use_fake_rating })
)
