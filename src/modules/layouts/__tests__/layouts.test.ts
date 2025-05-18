import * as R from 'ramda'
import fetchAllLayouts from '../actions/fetch-all-layouts'
import { cretateLayout } from '../layout-service'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

describe('testing layouts', () => {
  it.skip('should create layout', async () => {
    const title = 'test layout'
    await cretateLayout(title)
    await cretateLayout(title)

    const query = {
      limit: {
        page: 1,
        take: 1000,
      },
      order: {
        by: 'title',
        dir: 'desc',
      },
      filter: {
        title,
      },
    }
    const layoutsWithPagination = await fetchAllLayouts(query)
    const layouts = collectionToJson(layoutsWithPagination.data)

    expect(layouts.length).toBe(2)
    expect(R.pluck('title', layouts)).toEqual(expect.arrayContaining([title, title]))
  })
})
