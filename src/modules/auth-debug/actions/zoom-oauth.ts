import logger from '../../../../services/logger/logger'

export default async (query: any): Promise<any> => {
  logger.info('Zoom OAuth', { query })
  logger.info('Zoom OAuth code', query.code)
  logger.info('Zoom OAuth state', query.state)
}
