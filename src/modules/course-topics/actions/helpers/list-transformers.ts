import { DELETED_AT, renameProps } from '@desmart/js-utils'
import * as R from 'ramda'
import { collectionToJson } from '../../../../../utils/model/collection-to-json'

/**
 * These transformers alter the shape of the response so it can be used to generate links to parts of the book.
 */

const getBookItems = R.pipe(
  R.path(['bookContent', 'subchapter', 'chapter', 'book']),
  R.ifElse(
    R.anyPass([
      R.isNil,
      R.pipe(
        R.propEq(DELETED_AT, null),
        R.not
      ),
      R.prop('is_archived'),
    ]),
    R.always({ id: null, tag: null }),
    R.pick(['id', 'tag'])
  ),
  renameProps({ id: 'original_book_id' })
)

const getSubchapterItems = R.pipe(
  R.path(['bookContent', 'subchapter']),
  R.ifElse(
    R.anyPass([
      R.isNil,
      R.pipe(
        R.propEq(DELETED_AT, null),
        R.not
      ),
      R.prop('is_archived'),
    ]),
    R.always({ part: null, order: null }),
    R.pick(['part', 'order'])
  ),
  renameProps({ order: 'subchapter_order' })
)

const getChapterOrderItems = R.pipe(
  R.path(['bookContent', 'subchapter', 'chapter']),
  R.ifElse(
    R.anyPass([
      R.isNil,
      R.pipe(
        R.propEq(DELETED_AT, null),
        R.not
      ),
      R.prop('is_archived'),
    ]),
    R.always({ order: null }),
    R.pick(['order'])
  ),
  renameProps({ order: 'chapter_order' })
)

const getBookContentInfo = R.pipe(
  R.path(['bookContent']),
  R.ifElse(
    R.anyPass([
      R.isNil,
      R.pipe(
        R.propEq(DELETED_AT, null),
        R.not
      ),
      R.prop('is_archived'),
    ]),
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
    contentTopics: R.map(
      transformBookContentCourseTopics
    )(item.contentTopics),
  })
)

const cleanUp = R.map(
  item => ({
    ...item,
    contentTopics: R.pipe(
      R.map(
        R.omit(['bookContent'])
      ),
      R.filter(
        ct => !!(ct.original_book_id && ct.subchapter_order && ct.chapter_order && ct.content_id && ct.tag)
      )
    )(item.contentTopics),
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
