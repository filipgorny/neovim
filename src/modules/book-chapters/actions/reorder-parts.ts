import * as R from 'ramda'
import mapP from '../../../../utils/function/mapp'
import { setPartsById } from '../../book-subchapters/book-subchapter-service'
import { findOneOrFail } from '../book-chapter-repository'

type Payload = {
  parts: number[]
}

const findChapter = async (id: string) => (
  findOneOrFail({ id }, ['subchapters'])
)

const reorderItems = newOrder => items => {
  const grouped = R.groupBy(
    R.prop('part')
  )(items)

  return R.map(
    value => grouped[value]
  )(newOrder)
}

const updateSubchapters = (items) => (
  R.addIndex(R.map)(
    async (subchapters, index) => (
      mapP(
        async item => setPartsById(index + 1, item.order)(item.id)
      )(subchapters)
    )
  )(items)
)

const setOrdering = R.addIndex(R.map)(
  (item, index) => {
    item.order = index + 1

    return item
  }
)

/**
 * First we group the items in proper part order
 * then we need to flatten the data to set proper ordering
 * then we group the items again update the data properly
 */
export default async (id: string, payload: Payload) => (
  R.pipeWith(R.andThen)([
    findChapter,
    R.prop('subchapters'),
    R.sortBy(R.prop('order')),
    reorderItems(payload.parts),
    R.flatten,
    setOrdering,
    reorderItems(payload.parts),
    updateSubchapters,
  ])(id)
)
