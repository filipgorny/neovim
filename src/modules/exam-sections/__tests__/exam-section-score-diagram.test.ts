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

describe('exam score diagram', () => {
  it('percentile values', () => {
    const diagram = new ExamSectionScoreDiagram(begScore, endScore, scoreData, percentileRanking)
    const { percentile } = diagram.getDataForGraphs()

    expect(R.pipe(
      R.pluck('percentile'),
      R.map(Math.round)
    )(percentile)).toEqual(percentileRanking)
  })

  it('score values', () => {
    const scoresTest = [
      118, 118, 118, 118, 118, 118, 119, 119, 119, 119, 119, 120, 120, 120, 120, 120, 121, 121, 121, 121, 121, 122, 122, 122, 122, 123, 123, 123, 123, 124, 124, 124, 124, 124, 125, 125, 125, 126, 126, 126, 126, 127, 127, 127, 127, 128, 128, 128, 128, 129, 129, 129, 130, 130, 130, 131, 131, 131, 132, 132,
    ]

    const diagram = new ExamSectionScoreDiagram(begScore, endScore, scoreData, percentileRanking)
    const { percentile } = diagram.getDataForGraphs()

    expect(R.pluck('score')(percentile)).toEqual(scoresTest)
  })

  it('scores for lines in scored graph', () => {
    const scoresForLines = [
      118.6, 121.4, 124.2, 127.0, 129.8,
    ]

    const diagram = new ExamSectionScoreDiagram(begScore, endScore, scoreData, percentileRanking)
    const { scaled } = diagram.getDataForGraphs()

    expect(R.pipe(
      R.filter(R.prop('sigma')),
      R.map(R.pipe(
        R.prop('score'),
        score => Math.round(10 * score) / 10
      ))
    )(scaled)).toEqual(scoresForLines)
  })

  it('xes for lines in stats graph', () => {
    const xexForLines = [
      8.2, 19.6, 31.1, 42.5, 53.9,
    ]

    const diagram = new ExamSectionScoreDiagram(begScore, endScore, scoreData, percentileRanking)
    const { stats } = diagram.getDataForGraphs()

    expect(R.pipe(
      R.filter(R.prop('sigma')),
      R.map(R.pipe(
        R.prop('x'),
        x => Math.round(10 * x) / 10
      ))
    )(stats)).toEqual(xexForLines)
  })
})
