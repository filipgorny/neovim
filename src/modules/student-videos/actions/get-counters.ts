import * as R from 'ramda'
import { int } from '@desmart/js-utils'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentCourse } from '../../../types/student-course'
import getByCategory from './get-by-category'
import { fetchFavoriteVideos, findStudentVideos, findStudentVideosCount } from '../student-videos-repository'

const categories = [
  'review',
  'medreel',
  'onboarding',
  'recordings',
]

const getCountersForCategory = async (studentCourse: StudentCourse, query, category: string) => {
  const videos = await getByCategory(studentCourse, R.mergeDeepLeft({ filter: { category } }, query))

  return {
    category,
    count: videos.meta.recordsTotal,
  }
}

const defaultQuery = ({
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (student, studentCourse: StudentCourse, query) => {
  const booksVideos = await findStudentVideosCount(student.id, studentCourse)(prepareQuery(query), query.filter)
  const combinedFavouriteVideos = await fetchFavoriteVideos(student.id, studentCourse)(prepareQuery(query))
  const categoryCounters = await mapP(async category => getCountersForCategory(studentCourse, query, category))(categories)
  const booksCount = int(booksVideos.meta.recordsTotal)

  const allVideosCount = R.pipe(
    R.flatten,
    R.map(R.prop('count')),
    R.sum,
    R.add(booksCount)
  )(categoryCounters)

  return [
    {
      category: 'all',
      count: allVideosCount,
    },
    {
      category: 'books',
      count: booksCount,
    },
    {
      category: 'favourites',
      count: int(combinedFavouriteVideos.meta.recordsTotal),
    },
    ...categoryCounters,
  ]
}
