import * as R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-content-comments-repository'

const fetchComments = (course_id: string) => async (book_content_id: string) => (
  find({ limit: { take: 100, page: 1 }, order: { by: 'course_id', dir: 'asc' } }, { course_id, book_content_id })
)

const hydrateItems = R.map(
  R.evolve({
    comment_delta_object: JSON.parse,
  })
)

export default async (course_id: string, book_content_id: string) => (
  R.pipeWith(R.andThen)([
    fetchComments(course_id),
    R.prop('data'),
    collectionToJson,
    hydrateItems,
  ])(book_content_id)
)
