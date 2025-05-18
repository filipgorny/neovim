import httpClient from './vimeo-http-client'
import { AxiosError } from 'axios'
import { notFoundException, vimeoUnexpectedException } from '../../utils/error/error-factory'
import { HttpStatus } from '../../utils/enums/http-statuses'
import env from '../../utils/env'
import logger from '../logger/logger'
import { customException, throwException } from '@desmart/js-utils'

interface VimeoVideo {
  duration: number
  [key: string]: unknown;
}

export default async (videoId: string) => {
  videoId = videoId.replace('?h=', ':')
  logger.info({ videoId })
  try {
    const { data } = await httpClient.get<VimeoVideo>(`/videos/${videoId}`)

    return data
  } catch (e) {
    if (e?.isAxiosError) {
      logger.error('Vimeo video fetch error', { error: e, videoId })
      const responseHttpCode = (e as AxiosError).response.status

      if (responseHttpCode === HttpStatus.NotFound) {
        logger.error('Vimeo video not found', { responseHttpCode, videoId })
        throwException(customException('vimeo.video.not-found', 400, 'Vimeo video not found'))
      }
    }

    // skip logs in test run
    if (env('NODE_ENV') !== 'unit_test_env') {
      console.error(e)
    }

    throw vimeoUnexpectedException()
  }
}
