import * as R from 'ramda'
import { customException, throwException } from '../../../utils/error/error-factory'
import { mergeSortedArrays } from '../exam-sections/exam-section-score-diagram'

export class ExamScoreDiagram {
  private readonly begScore: number
  private readonly endScore: number
  private readonly scoreData: number[]
  private readonly percentileRanking: number[]
  private readonly studentsTotal: number
  private readonly maxY: number
  private readonly mu: number
  private readonly sigma: number

  constructor (begScore: number, endScore: number, scoreData: number[], percentileRanking?: number[]) {
    if (begScore === endScore) {
      throwException(customException('exam-score-diagram.score-range.cannot-contain-one-value', 403, 'score range cannot contain only one value'))
    }
    if (endScore - begScore + 1 !== scoreData.length) {
      throwException(customException('exam-score-diagram.score-data.doesnt-correspond-to-score-range', 403, "Score data and score range aren't aligned properly"))
    }
    if (percentileRanking && scoreData.length !== percentileRanking.length) {
      throwException(customException('exam-score-diagram.percentile-rank.doesnt-correspond-to-score-range', 403, "Percentile rank data and score range aren't aligned properly"))
    }

    this.begScore = begScore
    this.endScore = endScore
    this.scoreData = scoreData
    this.studentsTotal = R.sum(scoreData)
    this.maxY = Math.max(...scoreData)

    if (percentileRanking) {
      this.percentileRanking = percentileRanking
    } else {
      this.percentileRanking = ExamScoreDiagram.calculatePercentileRanking(scoreData, this.studentsTotal)
    }

    this.mu = ExamScoreDiagram.calculateMu(scoreData, this.studentsTotal)
    this.sigma = ExamScoreDiagram.calculateSigma(scoreData, this.studentsTotal, this.mu)
  }

  private static calculatePercentileRanking (scoreData: number[], studentsTotal: number) {
    const result = []
    for (let count = 0, i = 0; count <= studentsTotal; count += scoreData[++i]) {
      result.push(Math.round(count * 100 / studentsTotal))
    }
    return result
  }

  private get n (): number {
    return this.scoreData.length
  }

  private static calculateMu (scoreData: number[], studentsTotal: number): number {
    let mu = 0
    for (let i = 0; i < scoreData.length; i += 1) {
      mu += i * scoreData[i]
    }
    return mu / studentsTotal
  }

  private static calculateSigma (scoreData: number[], studentsTotal: number, mu: number): number {
    let sigma = 0
    for (let i = 0; i < scoreData.length; i += 1) {
      sigma += scoreData[i] * (mu - i) ** 2
    }
    return (sigma / (studentsTotal - 1)) ** 0.5
  }

  private fStats (x: number): number {
    return this.maxY * Math.exp(-0.5 * ((x - this.begScore - this.mu) / this.sigma) ** 2)
  }

  private getDataForStatsGraph (): object[] {
    let result = []
    if (this.sigma !== 0 && !Number.isNaN(this.sigma)) {
      for (let x = this.begScore; x <= this.endScore; x = (10 * x + 5) / 10) {
        result.push({
          x,
          students: this.fStats(x),
          sigma: false,
        })
      }
      const xesForLines = []

      for (let x = this.begScore + this.mu; x < this.endScore; x += this.sigma) {
        xesForLines.push(x)
      }
      for (let x = this.begScore + this.mu - this.sigma; x >= this.begScore; x -= this.sigma) {
        xesForLines.unshift(x)
      }

      const lines = R.map(x => ({
        x,
        students: this.fStats(x),
        sigma: true,
      }))(xesForLines)

      result = mergeSortedArrays(result, lines, (a, b) => a.x - b.x)
    }
    return result
  }

  private getDataForColumnDiagram (): object[] {
    const result = []
    for (let i = 0; i < this.n; i += 1) {
      result.push({
        students: this.scoreData[i],
        score: this.begScore + i,
        percentile: this.percentileRanking[i],
      })
    }
    return result
  }

  public getDataForGraphs (): { stats: object[], percentile: object[], legend: object } {
    return {
      stats: this.getDataForStatsGraph(),
      percentile: this.getDataForColumnDiagram(),
      legend: {
        stats: {
          sigma: this.sigma,
          mu: this.begScore + this.mu,
        },
      },
    }
  }
}
