import * as R from 'ramda'
import { ExamSectionScoreDiagram } from '../exam-section-score-diagram'

const begScore = 118
const endScore = 132
const scoreData = [
  [0, 1, 1, 1, 1, 2], // 118
  [2, 2, 3, 3, 3], // 119
  [3, 4, 4, 4, 4], // 120
  [5, 5, 5, 5, 6], // 121
  [6, 7, 8, 9], // 122
  [10, 11, 12, 12], // 123
  [13, 14, 15, 16, 16], // 124
  [16, 14, 13], // 125
  [12, 11, 10, 9], // 126
  [8, 7, 6, 6], // 127
  [5, 5, 4, 4], // 128
  [4, 3, 3], // 129
  [3, 3, 2], // 130
  [2, 2, 1], // 131
  [1, 1], // 132
]

const percentileRanking = [
  0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17, 19, 21, 23, 26, 28, 31, 35, 38, 41, 45, 49, 54, 58, 62, 66, 70, 73, 76, 79, 81, 83, 85, 87, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 98, 99, 99, 99, 100, 100,
]

export default async () => {
  const diagram = new ExamSectionScoreDiagram(begScore, endScore, scoreData, percentileRanking)
  return diagram.getDataForGraphs()
}
