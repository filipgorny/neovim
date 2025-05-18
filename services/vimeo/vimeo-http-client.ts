import axios from 'axios'
import { VIMEO_API_BASE_URL } from './vimeo-constants'
import env from '../../utils/env'
import { HttpStatus } from '../../utils/enums/http-statuses'

export default axios.create({
  baseURL: VIMEO_API_BASE_URL,
  headers: {
    authorization: `bearer ${env('VIMEO_ACCESS_TOKEN')}`,
  },
  validateStatus: status => status === HttpStatus.Ok,
})
