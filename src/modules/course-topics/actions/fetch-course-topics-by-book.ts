import * as R from 'ramda'
import { transformDataForListView } from './helpers/list-transformers'
import { findCourseTopics } from '../course-topics-repository'

const getSearchQuery = R.pathOr(undefined, ['filter', 'search'])

export default async (course_id: string, query) => (
  R.pipeWith(R.andThen)([
    async () => findCourseTopics(query, { search: getSearchQuery(query), course_id }, ['contentTopics.bookContent.subchapter.chapter.book']),
    transformDataForListView,
  ])(true)
)
