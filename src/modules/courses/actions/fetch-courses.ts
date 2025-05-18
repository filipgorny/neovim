import R from 'ramda'
import { findOneOrFail as findAdmin } from '../../admins/admin-repository'
import { find, findAttachedToAdmin, findOneOrFail } from '../course-repository'
import asAsync from '../../../../utils/function/as-async'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import mapP from '@desmart/js-utils/dist/function/mapp'

const defaultQuery = ({
  order: {
    by: 'title',
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

export default async (admin, query) => {
  const profile = await findAdmin({ id: admin.id }, ['adminCourses.course'])

  /**
   * If the admin is assigned to at least one course, the query must be narrowed down to only those courses.
   */
  const searchFunction = R.pipe(
    R.prop('adminCourses'),
    R.ifElse(
      R.isEmpty,
      R.always(find),
      R.always(findAttachedToAdmin(admin.id))
    )
  )(profile)

  const results = await R.pipeWith(R.andThen)([
    asAsync(prepareQuery),
    async query => searchFunction(query, {}, ['attached.exam', 'books.attached.exam', 'books.chapters.attached.exam', 'books']),
  ])(query)

  if (profile.adminCourses.length) {
    const enhancedResults = await mapP(async adminCourse => {
      return findOneOrFail({ id: adminCourse.course_id }, ['attached.exam', 'books.attached.exam', 'books.chapters.attached.exam', 'books'])
    })(results.data)

    const finalResults = {
      data: enhancedResults,
      meta: results.meta,
    }

    return R.pipe(
      R.over(R.lensProp('data'), R.map(R.over(R.lensProp('attached'), R.sortBy(R.path(['exam', 'title']))))),
      R.over(R.lensProp('data'), R.map(R.over(R.lensProp('books'), R.sortBy(R.prop('title')))))
    )(finalResults)
  } else {
    return R.pipe(
      R.over(R.lensProp('data'), collectionToJson),
      R.over(R.lensProp('data'), R.map(R.over(R.lensProp('attached'), R.sortBy(R.path(['exam', 'title']))))),
      R.over(R.lensProp('data'), R.map(R.over(R.lensProp('books'), R.sortBy(R.prop('title')))))
    )(results)
  }
}
