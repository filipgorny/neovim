import * as R from 'ramda'
import { findPeriodResults } from '../respiration-games-repository'

export default async query => (
  findPeriodResults(query.beginDate, query.endDate, query.bloxGameEnabled === 'true', true, query.difficulty)
)
