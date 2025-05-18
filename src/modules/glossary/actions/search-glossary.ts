import * as R from 'ramda'
import mapP from '../../../../utils/function/mapp'
import { findGlossaryRecords, findGlossaryRecordsForStudent, findOneGlossaryWithOccurances } from '../glossary-repository'

const defaultQuery = ({
  order: {
    by: 'phrase_raw',
    dir: 'asc',
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

const withOccurances = R.pipe(
  R.prop('occurances'),
  Boolean
)

const findWithOccurances = async query => {
  const records = await findGlossaryRecordsForStudent(prepareQuery(query), query.filter)

  const ids = R.pipe(
    R.prop('data'),
    R.pluck('id')
  )(records)

  const glossaryItems = await mapP(findOneGlossaryWithOccurances)(ids)

  return R.mergeLeft({
    data: glossaryItems,
  })(records)
}

export default async query => (
  withOccurances(query)
    ? findWithOccurances(query)
    : findGlossaryRecordsForStudent(prepareQuery(query), query.filter)
)
