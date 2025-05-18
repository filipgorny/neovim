/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import orm from '../../src/models'
import mapP from '../../utils/function/mapp'
import { splitVideoById } from '../../src/modules/videos/video-service'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start splitting videos')

  const RECORDS_PER_BATCH = 20

  const videos = await knex.select('id').from('videos')

  for (let i = 0; i < videos.length; i += RECORDS_PER_BATCH) {
    await mapP(
      async ({ id }) => splitVideoById(id)
    )(R.slice(i, i + RECORDS_PER_BATCH, videos))
  }

  console.log('done splitting videos')
  process.exit(0)
})()
