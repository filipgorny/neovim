import R from 'ramda'

export const defaultStudentExamScores = PTS => {
  const scores = [R.sum(PTS), ...PTS]
  const list = []

  for (let i = 0; i < scores.length; i++) {
    list.push({
      name: i === 0 ? 'total' : `section_${i}`,
      order: i,
      target_score: scores[i],
      pts: scores[i]
    })
  }

  return list
}
