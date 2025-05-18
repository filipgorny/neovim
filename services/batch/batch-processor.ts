const batchResultIsEmpty = batchResult => !batchResult || !batchResult.length
const hasReachedLimitOfBatchesToProcess = batchAmountLimit => batchNumber => batchAmountLimit && batchAmountLimit === batchNumber

export const processInBatches = async (nextBatch, processBatch, step, startFrom = 0, batchAmountLimit = 0) => {
  let batchNumber = startFrom || 0
  let shouldProcessNextBatch = true
  let batch, result
  const hasReachedGivenLimitOfBatchesToProcess = hasReachedLimitOfBatchesToProcess(batchAmountLimit)

  while (shouldProcessNextBatch) {
    batch = await nextBatch(batchNumber, step)

    if (batchResultIsEmpty(batch)) {
      shouldProcessNextBatch = false

      break
    }

    batchNumber++

    result = await processBatch(batch, result, batchNumber)

    if (hasReachedGivenLimitOfBatchesToProcess(batchNumber)) {
      shouldProcessNextBatch = false

      break
    }
  }

  return Promise.resolve(result)
}
