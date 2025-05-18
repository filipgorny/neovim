import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { fetchVideosByCategory } from '../../videos/video-repository'
import { findOne as findFavVideo } from '../../favourite-videos/favourite-videos-repository'
import { findOne as findWatchedVideo } from '../../student-videos/student-videos-repository'
import generateStaticUrl from '../../../../services/s3/generate-static-url'

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

export default async (studentCourse: StudentCourse, query) => (
  R.pipeWith(R.andThen)([
    fetchVideosByCategory(studentCourse.student_id, studentCourse),
  ])(prepareQuery(query))
)
