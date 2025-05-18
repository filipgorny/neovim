import R from 'ramda'
import { create, findOne } from '../../src/modules/salty-bucks-daily-log/salty-bucks-daily-log-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import mapP from '../../utils/function/mapp'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetch } from '../../utils/model/fetch'
import { Student } from '../../src/models'
import moment from 'moment'
import { DATE_FORMAT_YMD } from '../../src/constants'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> logging current student Salty Bucks balance; batch ${batchNumber}`)

const subtractNDaysToDate = date => n => (
  moment(date).subtract(n, 'days').format(DATE_FORMAT_YMD)
)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'created_at',
    dir: 'desc',
  },
})

const calculateBalanceDiff = (currentBalanceValue, pastBalance) => {
  const balanceValue = R.propOr(0, 'balance')(pastBalance)

  return currentBalanceValue - balanceValue
}

const logBalance = async student => {
  const today = new Date()
  const balance = student.salty_bucks_balance

  const [balance1DayAgo, balance7DayAgo, balance30DayAgo] = await Promise.all([
    findOne({ student_id: student.id, created_at: subtractNDaysToDate(today)(1) }),
    findOne({ student_id: student.id, created_at: subtractNDaysToDate(today)(7) }),
    findOne({ student_id: student.id, created_at: subtractNDaysToDate(today)(30) }),
  ])

  try {
    await create({
      student_id: student.id,
      balance: balance,
      balance_diff_1: calculateBalanceDiff(balance, balance1DayAgo),
      balance_diff_7: calculateBalanceDiff(balance, balance7DayAgo),
      balance_diff_30: calculateBalanceDiff(balance, balance30DayAgo),
    })
  } catch (e) {}
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(logBalance)(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetch(Student)({}, [], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

export const logDailySaltyBucksBalance = async () => {
  console.log('logDailySaltyBucksBalance')

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  return true
}
