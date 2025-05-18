import * as R from 'ramda'
import { customException, throwException } from '../../../utils/error/error-factory'
import { int } from '../../../utils/number/int'

export const mergeSortedArrays = (a, b, sortFn) => {
  let sorted = []
  let indexA = 0
  let indexB = 0

  while (indexA < a.length && indexB < b.length) {
    if (sortFn(a[indexA], b[indexB]) > 0) {
      sorted.push(b[indexB++])
    } else {
      sorted.push(a[indexA++])
    }
  }

  if (indexB < b.length) {
    sorted = sorted.concat(b.slice(indexB))
  } else {
    sorted = sorted.concat(a.slice(indexA))
  }

  return sorted
}

function sortFn (a, b) {
  return a.x - b.x
}

export class ExamSectionScoreDiagram {
  private readonly begScore: number
  private readonly endScore: number
  private readonly scoreData: number[][]
  private readonly studentsByNumQuestions: number[]
  private readonly studentsTotal: number
  private readonly scoreToX: number[]
  private readonly maxScaledScore: number
  private readonly maxY: number
  private readonly percentileRanking: number[]
  private readonly mu: number
  private readonly sigma: number
  private readonly scaledMu: number
  private readonly scaledSigma: number

  constructor (begScore: number, endScore: number, scoreData: number[][], percentileRanking: number[]) {
    if (begScore === endScore) {
      throwException(customException('exam-section-score-diagram.score-range.cannot-contain-one-value', 403, 'score range cannot contain only one value'))
    }
    if (scoreData.length !== endScore - begScore + 1) {
      throwException(customException('exam-section-score-diagram.score-data.doesnt-correspond-to-score-range', 403, "score data and score range aren't aligned properly"))
    }
    if (scoreData.length && (scoreData[0].length === 0 || scoreData[scoreData.length - 1].length === 0)) {
      throwException(customException('exam-section-score-diagram.score.cannot-lack-stats', 403, 'first and last arrays from score data cannot be empty'))
    }
    if (R.sum(R.map(arr => arr.length)(scoreData)) !== percentileRanking.length) {
      throwException(customException('exam-section-score-diagram.percentile-ranking.doesnt-correspond-to-score-data', 403, 'score data and percentile ranking do not match'))
    }

    this.begScore = begScore
    this.endScore = endScore
    this.scoreData = R.clone(scoreData)
    this.studentsByNumQuestions = R.flatten(scoreData)
    this.studentsTotal = R.sum(this.studentsByNumQuestions)
    this.scoreToX = this.convertScoresToXes()
    this.maxScaledScore = this.findMaxScaledScore()
    this.maxY = Math.max(...this.studentsByNumQuestions)
    this.percentileRanking = percentileRanking
    this.mu = this.calculateMu()
    this.sigma = this.calculateSigma()
    this.scaledMu = this.calculateScaledMu()
    this.scaledSigma = this.calculateScaledSigma()
  }

  private fStats (x: number): number {
    return this.maxY * Math.exp(-0.5 * ((x - this.mu) / this.sigma) ** 2)
  }

  private calculateMu (): number {
    let mu = 0
    for (let i = 0; i < this.n; i += 1) {
      mu += i * this.getStudents(i)
    }
    return mu / this.studentsTotal
  }

  private calculateSigma (): number {
    let sigma = 0
    for (let i = 0; i < this.n; i += 1) {
      sigma += this.getStudents(i) * (this.mu - i) ** 2
    }

    return (sigma / (this.studentsTotal - 1)) ** 0.5
  }

  private calculateScaledMu (): number {
    let mu = 0
    for (let score = this.begScore; score <= this.endScore; score += 1) {
      mu += score * this.getScaledScore(score)
    }
    return mu / this.studentsTotal
  }

  private calculateScaledSigma (): number {
    let sigma = 0
    for (let score = this.begScore; score <= this.endScore; score += 1) {
      sigma += this.getScaledScore(score) * (this.scaledMu - score) ** 2
    }
    return (sigma / (this.studentsTotal - 1)) ** 0.5
  }

  // private calculatePercentileRanking (): number[] {
  //   const result = []
  //   for (let count = 0, i = 0; count <= this.studentsTotal; count += this.studentsByNumQuestions[++i]) {
  //     result.push(Math.round(count * 100 / this.studentsTotal))
  //   }
  //   return result
  // }

  private getPercentileRank (i: number): number {
    return this.percentileRanking[i]
  }

  private convertScoresToXes (): number[] {
    const result = []
    for (let i = 0, j = 0; j < this.scoreData.length; i += this.scoreData[j].length, j += 1) {
      result.push(i + (this.scoreData[j].length - 1) / 2)
    }
    return result
  }

  private findMaxScaledScore (): number {
    let max = -Infinity
    for (let score = this.begScore; score <= this.endScore; score += 1) {
      const ScaledScore = this.getScaledScore(score)
      if (ScaledScore > max) {
        max = ScaledScore
      }
    }
    return max
  }

  private get n (): number {
    return this.studentsByNumQuestions.length
  }

  private getStudents (i: number): number {
    if (this.iIsValid(i)) {
      return this.studentsByNumQuestions[i]
    }
    throw new Error(`i must be integer between 0 and ${this.n - 1}`)
  }

  private iIsValid (i: number): boolean {
    return int(i) === i && i < this.n && i >= 0
  }

  private scoreIsValid (score: number): boolean {
    return int(score) === score && score >= this.begScore && score <= this.endScore
  }

  private getScoreValues (score: number): number[] {
    if (!this.scoreIsValid(score)) throw new Error('score must be valid')
    return this.scoreData[score - this.begScore]
  }

  private getScaledScore (score: number): number { // scaled score
    return R.sum(this.getScoreValues(score))
  }

  private getXByScaledScore (score: number): number {
    if (!this.scoreIsValid(score)) throw new Error('score must be valid')
    return this.scoreToX[score - this.begScore]
  }

  private getXScaledScoreByDecimalScore (score: number): number {
    if (this.scoreIsValid(score)) {
      return this.getXByScaledScore(score)
    } else {
      return this.getXByScaledScore(Math.floor(score)) +
        (this.getXByScaledScore(Math.ceil(score)) - this.getXByScaledScore(Math.floor(score))) *
        (score - Math.floor(score))
    }
  }

  private getYByScaledScore (score: number): number {
    return this.getScaledScore(score) * this.maxY / this.maxScaledScore
  }

  private getScore (i: number): number {
    if (!this.iIsValid(i)) throw new Error('i must be valid')
    let length = 0
    let score = this.begScore
    for (; length <= i && score <= this.endScore; score += 1) {
      length += this.scoreData[score - this.begScore].length
    }
    return score - 1
  }

  private getDataForColumnDiagram (): object[] {
    const result = []
    for (let i = 0; i < this.n; i += 1) {
      result.push({
        correct: i,
        students: this.getStudents(i),
        score: this.getScore(i),
        percentile: this.getPercentileRank(i),
      })
    }
    return result
  }

  private getDataForScaledGraph (): object[] {
    let result = []

    if (this.scaledSigma !== 0 && !Number.isNaN(this.scaledSigma)) {
      result.push({
        x: 0,
        students: 0,
        sigma: false,
      })
      for (let score = this.begScore; score <= this.endScore; score += 1) {
        result.push({
          x: this.getXByScaledScore(score),
          students: this.getYByScaledScore(score),
          score,
          sigma: false,
        })
      }
      result.push({
        x: this.n - 1,
        students: 0,
        sigma: false,
      })
      const scalesForLines = []
      for (let score = this.scaledMu; score <= this.endScore; score += this.scaledSigma) {
        scalesForLines.push(score)
      }
      for (let score = this.scaledMu - this.scaledSigma; score >= this.begScore; score -= this.scaledSigma) {
        scalesForLines.unshift(score)
      }

      const lines = R.map(score => ({
        x: this.getXScaledScoreByDecimalScore(score),
        students: null,
        score: Math.round(100 * score) / 100,
        sigma: true,
      }))(scalesForLines)

      result = mergeSortedArrays(result, lines, sortFn)
    }

    return result
  }

  private getDataForStatsGraph (): object[] {
    let result = []

    if (this.sigma !== 0 && !Number.isNaN(this.sigma)) {
      for (let x = 0; x <= this.n - 1; x = (10 * x + 5) / 10) {
        result.push({
          x,
          students: this.fStats(x),
          sigma: false,
        })
      }

      const xesForLines = []

      for (let x = this.mu; x <= this.n - 1; x += this.sigma) {
        xesForLines.push(x)
      }

      for (let x = this.mu - this.sigma; x >= 0; x -= this.sigma) {
        xesForLines.unshift(x)
      }

      const lines = R.map(x => ({
        x,
        students: this.fStats(x),
        sigma: true,
      }))(xesForLines)

      result = mergeSortedArrays(result, lines, sortFn)
    }

    return result
  }

  public getDataForGraphs (): { stats: object[], scaled: object[], percentile: object[], legend: object } {
    return {
      stats: this.getDataForStatsGraph(),
      scaled: this.getDataForScaledGraph(),
      percentile: this.getDataForColumnDiagram(),
      legend: {
        scaled: {
          sigma: this.scaledSigma,
          mu: this.scaledMu,
        },
        stats: {
          sigma: this.sigma,
          mu: this.mu,
        },
      },
    }
  }
}
