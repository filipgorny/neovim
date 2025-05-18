import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { findIncompleteEvents } from '../../src/modules/student-calendar-events/student-calendar-events-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { patchEntity } from '../../src/modules/student-calendar-events/student-calendar-events-service'
import { CalendarEventStatus } from '../../src/modules/student-calendar-events/calendar-event-status'

const RECORDS_PER_BATCH = 50

const log = batchNumber => console.log(`-> reschedule incomplete calendar events; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => findIncompleteEvents(RECORDS_PER_BATCH),
  ])(true)
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async event => patchEntity(event.id, { status: CalendarEventStatus.skipped })
  )(batch)
}

export const rescheduleIncompleteEvents = async () => (
  processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
)
