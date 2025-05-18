import { renameProps } from '@desmart/js-utils'
import * as R from 'ramda'
import { collectionToJson } from '../../../../../utils/model/collection-to-json'

/**
 * These transformers alter the shape of the response so it can be used to generate links to parts of the book.
 */

const getBookItems = R.pipe(
  R.path(['studentBookContent', 'subchapter', 'chapter', 'book']),
  R.ifElse(
    R.isNil,
    R.always({ book_id: null, tag: null }),
    R.pick(['book_id', 'tag'])
  ),
  renameProps({ book_id: 'original_book_id' })
)

const getSubchapterItems = R.pipe(
  R.path(['studentBookContent', 'subchapter']),
  R.ifElse(
    R.isNil,
    R.always({ part: null, order: null }),
    R.pick(['part', 'order'])
  ),
  renameProps({ order: 'subchapter_order' })
)

const getChapterOrderItems = R.pipe(
  R.pathOr(null, ['studentBookContent', 'subchapter', 'chapter', 'order']),
  R.objOf('chapter_order')
)

const getBookContentInfo = R.pipe(
  R.path(['studentBookContent']),
  R.ifElse(
    R.isNil,
    R.always({ id: null }),
    R.pick(['id'])
  ),
  renameProps({ id: 'content_id' })
)

const transformBookContentCourseTopics = topic => ({
  ...topic,
  ...getSubchapterItems(topic),
  ...getBookItems(topic),
  ...getBookContentInfo(topic),
  ...getChapterOrderItems(topic),
})

const transformInnerData = R.map(
  item => ({
    ...item,
    bookContentCourseTopics: R.map(
      transformBookContentCourseTopics
    )(item.bookContentCourseTopics),
  })
)

const cleanUp = R.map(
  item => ({
    ...item,
    bookContentCourseTopics: R.map(
      R.omit(['studentBookContent'])
    )(item.bookContentCourseTopics),
  })
)

export const transformDataForListView = data => ({
  data: R.pipe(
    R.prop('data'),
    collectionToJson,
    transformInnerData,
    cleanUp
  )(data),
  meta: data.meta,
})
