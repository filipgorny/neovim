import * as R from 'ramda'
import moment from 'moment'
import { findPeriodResults } from '../respiration-games-repository'
import { DATETIME_DATABASE_FORMAT } from '../../../constants'

export default async query => (
  findPeriodResults(moment().subtract(1, 'months').format(DATETIME_DATABASE_FORMAT), moment().format(DATETIME_DATABASE_FORMAT), query.bloxGameEnabled === 'true', false, query.difficulty)
)
