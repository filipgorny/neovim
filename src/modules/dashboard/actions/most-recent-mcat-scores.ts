import R from 'ramda'
import { fetchMostRecentlyCompletedFullMcat } from '../../student-exams/student-exam-repository'

const emptyScores = {
  sections: [
    { scaled_score: 0, title: 'Physics' },
    { scaled_score: 0, title: 'CARS' },
    { scaled_score: 0, title: 'Biology' },
    { scaled_score: 0, title: 'Psych' },
  ],
}

const prepareScores = R.pipe(
  R.propOr(null, 'scores'),
  JSON.parse,
  R.when(
    R.isNil,
    R.always(emptyScores)
  )
)

const getSectionValues = prop => R.pipe(
  R.propOr([], 'sections'),
  R.pluck(prop)
)

export default async (student, studentCourse) => {
  const exam = await fetchMostRecentlyCompletedFullMcat(student.id, studentCourse.id)
  const scores = prepareScores(exam)

  return {
    mcatTags: getSectionValues('title')(scores),
    mcatData: getSectionValues('scaled_score')(scores),
  }
}
