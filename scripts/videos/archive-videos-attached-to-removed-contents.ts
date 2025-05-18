/* eslint-disable @typescript-eslint/no-floating-promises */
import orm from '../../src/models'
import * as R from 'ramda'
import mapP from '../../utils/function/mapp'
import { copyVideoById } from '../../src/modules/videos/video-service'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start archiving videos attached to removed contents')

  let videoIds = await knex
    .select('v.id')
    .from({ v: 'videos' })
    .leftJoin({ bcr: 'book_content_resources' }, 'v.id', 'bcr.external_id')
    .leftJoin({ bc: 'book_contents' }, 'bc.id', 'bcr.content_id')
    .whereNotNull('bc.deleted_at')
    .where('v.is_archived', false)
  videoIds = R.pluck('id', videoIds)

  await mapP(
    copyVideoById
  )(videoIds)

  await knex('videos').whereIn('id', videoIds).update({ is_archived: true })

  console.log('done')
  process.exit(0)
})()
