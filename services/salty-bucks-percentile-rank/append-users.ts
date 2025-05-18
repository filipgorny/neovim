import { randomString, shuffleArray } from '@desmart/js-utils'
import * as R from 'ramda'
import { artificialUsernames } from './artificial-usernames'

const USERNAMES = shuffleArray(artificialUsernames)

type PercentileRankStudent = {
  id: string,
  name: string,
  salty_bucks_balance: number,
  percentile_rank: number,
  percentile_position: number
}

const getSameOrLess = (value: number, reduceBy: number = 1, shouldDecreaseValues = true): number => (
  shouldDecreaseValues ? Math.max(value - reduceBy, 0) : value
)

const getRandomFromRange = (min: number, max: number): number => (
  Math.round(
    Math.random() * (max - min) + min
  )
)

const createArtificialStudent = (baseStudent: PercentileRankStudent, index: number): PercentileRankStudent => {
  const shouldDecreaseValues = Math.random() < 0.5

  return {
    id: randomString(),
    name: USERNAMES[index],
    salty_bucks_balance: getSameOrLess(baseStudent.salty_bucks_balance, getRandomFromRange(0, 13), shouldDecreaseValues),
    percentile_rank: getSameOrLess(baseStudent.percentile_rank, 1, shouldDecreaseValues),
    percentile_position: baseStudent.percentile_position + 1,
  }
}

/**
 * Appends ten artificial students to the list.
 * They are randomly generated based on the last student's data (including artificial students).
 * Their salty bucks balance is decreased by a random amount between 0 and 13.
 * Their percentile rank is decreased by 1 or stays the same.
 */
export const appendUsers = (student: PercentileRankStudent, list: PercentileRankStudent[]) => {
  const clonedList = R.clone(list)

  for (let i = 0; i < 10; i++) {
    const baseStudent = R.last(clonedList)

    clonedList.push(
      createArtificialStudent(baseStudent, i)
    )
  }

  return clonedList
}
