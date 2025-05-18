import * as R from 'ramda'

/**
 * Transforms live class events to a map of "student exam ids" to live class event.
 * live_class and custom_live_class events do not actually use student_exam_ids, we recycle this field to store the student_calendar_event_id.
 * This was created when the feature for additional live class events was introduced (custom live_class events from outside the current expiration course).
 */
export const transformLiveClassEvents = R.pipe(
  R.map(
    R.pick(['student_exam_ids', 'type', 'id'])
  ),
  R.map(
    item => ({
      [item.student_exam_ids]: { type: item.type, id: item.id },
    })
  ),
  R.mergeAll
)
