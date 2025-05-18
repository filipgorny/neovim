import * as R from 'ramda'
import { findCourseTopics } from '../course-topics-repository'

const getSearchQuery = R.pathOr(undefined, ['filter', 'search'])

export default async (course_id: string, query) => (
  findCourseTopics(query, { search: getSearchQuery(query), course_id })
)
