import R from 'ramda'
import { invoke } from '@desmart/js-utils'
import renameProps from '../../../../utils/object/rename-props'
import { StudentCourse } from '../../../types/student-course'
import { StudentCourseTypes } from '../../student-courses/student-course-types'
import { fetchStudentBooks } from '../student-book-repository'

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

const includeBookmarkInfo = R.pipe(
  R.path(['bookmark', 'subchapter']),
  R.unless(
    R.isNil,
    R.pipe(
      R.pick(['id', 'order', 'part']),
      renameProps({
        id: 'bookmark_subchapter_id',
        order: 'bookmark_subchapter_order',
        part: 'bookmark_subchapter_part',
      })
    )
  )
)

const transformChapters = R.over(
  R.lensProp('chapters'),
  R.map(
    R.pipe(
      R.juxt([
        R.pick(['id', 'title', 'original_chapter_id', 'order', 'bookmark_id']),
        includeBookmarkInfo,
      ]),
      R.mergeAll
    )
  )
)

const transformBook = R.pipe(
  R.juxt([
    R.identity,
    R.pipe(
      R.juxt([
        R.pipe(
          R.prop('book'),
          R.ifElse(
            R.isEmpty,
            R.always('original book is removed'),
            R.prop('flashcards_accessible')
          ),
          R.objOf('flashcards_accessible')
        ),
        R.pipe(
          R.path(['book', 'ai_tutor_enabled']),
          R.objOf('ai_tutor_enabled')
        ),
      ]),
      R.mergeAll
    ),
  ]),
  R.mergeAll
)

export default async (instance, query, studentCourse: StudentCourse) => R.pipeWith(R.andThen)([
  fetchStudentBooks(instance.get('id'), studentCourse?.id, studentCourse?.type === StudentCourseTypes.freeTrial),
  R.over(
    R.lensProp('data'),
    R.map(
      R.pipe(
        invoke('toJSON'),
        R.pick(['id', 'title', 'external_id', 'book_id', 'course_id', 'created_at', 'tag', 'tag_colour', 'chapters', 'image_url', 'is_free_trial', 'book', 'is_test_bundle', 'header_abbreviation', 'ai_tutor_enabled']),
        renameProps({ is_free_trial: 'is_available' }),
        transformChapters,
        transformBook
      )
    )
  ),
])(prepareQuery(query))
