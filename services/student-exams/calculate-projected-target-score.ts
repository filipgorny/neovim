/***
 Projected target score (PTS)

 The PTS is based on the scores of the exams already taken. We calculate the WIA (calculate-weighted-average-improvement.ts)
 and "predict" the score of the real MCAT exam.

 For example:
 1. Student took three exams with scores: 480, 484, 485. We extrapolate three more exams (two to be taken, the last one
 is the real MCAT). PTS = 491
 2. Student took fixe exams with scores: 480, 484, 485, 486, 488. We extrapolate one exam - the real MCAT. PTS = 489.7
 3. Student took one exam with score: 500. PTS = 500 because WIA = 0 (too little data to predict anything)

 The student can exclude some exams from calculations, then we have to include this fact - it "shortens" the distance to
 the real MCAT.
 */

import * as R from 'ramda'
import { calculateWeightedAverageImprovement } from './calculate-weighted-average-improvement'
import { getSetting } from '../../src/modules/settings/settings-service'
import mapP from '../../utils/function/mapp'
import {
  SECTION_SCALED_SCORE_MAX_VALUE,
  SECTION_SCALED_SCORE_MIN_VALUE
} from '../../src/modules/scaled-scores/section-scaled-score-range'
import { Settings } from '../../src/modules/settings/settings'

export const calculateProjectedTargetScore = async (scores: number[], excludedExamsCount = 0) => {
  const examAmountThreshold = await getSetting(Settings.ExamAmountThreshold)
  const realMcatDistance = examAmountThreshold + 1 - scores.length - excludedExamsCount
  const projectedImprovement = realMcatDistance * calculateWeightedAverageImprovement(scores)

  return R.pipe(
    R.last,
    R.when(
      R.isNil,
      R.always(0)
    ),
    R.add(projectedImprovement),
    Math.round,
    R.cond([
      [R.gt(SECTION_SCALED_SCORE_MIN_VALUE), R.always(SECTION_SCALED_SCORE_MIN_VALUE)],
      [R.lt(SECTION_SCALED_SCORE_MAX_VALUE), R.always(SECTION_SCALED_SCORE_MAX_VALUE)],
      [R.T, R.identity],
    ])
  )(scores)
}

// @ts-ignore
const countExcludedExams = (exams: []): number => (
  R.pipe(
    R.filter(
      R.propEq('is_excluded_from_pts', true)
    ),
    // @ts-ignore
    R.length
    // @ts-ignore
  )(exams)
)

const extractSectionScores = (sections, sectionIndex) => R.pipe(
  R.map(
    R.nth(sectionIndex)
  ),
  // @ts-ignore
  R.pluck('scaled_score')
  // @ts-ignore
)(sections)

const extractAndOrderScores = sections => {
  const list = []
  const sectionLength = R.pipe(
    R.map(R.prop('length')),
    R.apply(Math.max)
  )(sections)

  for (let i = 0; i < sectionLength; i++) {
    list.push(extractSectionScores(sections, i))
  }

  return list
}

// @ts-ignore
export const extractExamScores = (exams: object[]): number[] => (
  R.pipe(
    R.reject(
      R.propEq('is_excluded_from_pts', true)
    ),
    // @ts-ignore
    R.pluck('scores'),
    R.map(
      R.pipe(
        JSON.parse,
        R.prop('sections')
      )
    ),
    extractAndOrderScores
    // @ts-ignore
  )(exams)
)

export const calculatePTS = async (exams): Promise<number[]> => {
  const excludedExamsCount = countExcludedExams(exams)
  const sectionScores = extractExamScores(exams)

  // @ts-ignore
  return mapP(
    async scores => calculateProjectedTargetScore(scores, excludedExamsCount)
  )(sectionScores)
}
