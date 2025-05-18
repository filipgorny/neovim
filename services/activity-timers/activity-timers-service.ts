/**
 * Universal method for upserting activity timers (works for courses, books, chapters etc.)
 *
 * @param createFn (Function) The "create" function from appropriate repository
 * @param patchFn (Function) The "patch" function from appropriate repository
 *
 * @param payload (object) Data to be saved
 * @param seconds (Number) Amount of seconds to be added to the timer
 * @param existingTimer (object | undefined) Previous timer, if exists
 * @param trx (any) Bookshelf transaction
 */
export const upsertAbstractActivityTimer = (createFn, patchFn) => async (payload, seconds, existingTimer, trx) => (
  existingTimer
    ? patchFn(existingTimer.id, {
      seconds: existingTimer.seconds + seconds,
    }, trx)
    : createFn({
      ...payload,
      seconds,
    }, trx)
)
