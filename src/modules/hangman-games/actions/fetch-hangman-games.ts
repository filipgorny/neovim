import * as R from 'ramda'
import { find } from '../hangman-games-repository'
import { customException, throwException } from '@desmart/js-utils'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { getUsername } from '../../students/student-service'

const defaultQuery = ({
  order: {
    by: 'score',
    dir: 'desc',
  },
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

enum Period {
  day = 'day',
  week = 'week',
  month = 'month',
}

export default async (query, period?: string) => {
  if (period && !Object.values(Period).includes(period as any)) {
    throwException(customException('hangman-games.invalid-period', 400, 'Invalid period'))
  }

  const result = await find(prepareQuery(query), function () {
    if (period) {
      this.where(query.filter || {}).whereRaw(`created_at >= now() - interval '1 ${period}'`)
    } else {
      this.where(query.filter || {})
    }
  })

  return {
    data: await mapP(async (item) => {
      const result = item.toJSON()

      result.username = await getUsername(item.get('student_id'))

      return result
    })(result.data),
    meta: result.meta,
  }
}
