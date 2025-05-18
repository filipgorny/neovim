// import * as R from 'ramda'
// import { convertDeltaToHtml } from 'node-quill-converter'
// import { processInBatches } from '../../services/batch/batch-processor'
// import { fetchCustom } from '../../utils/model/fetch'
// import { BookContentFlashcard } from '../../src/models'
// import { patch } from '../../src/modules/flashcards/flashcard-repository'
// import mapP from '../../utils/function/mapp'
// import { collectionToJson } from '../../utils/model/collection-to-json'
// import asAsync from '../../utils/function/as-async'
// import { stripHtml } from '../../utils/string/strip-html'

// const RECORDS_PER_BATCH = 10

// const log = batchNumber => console.log(`-> remap flashcards delta to raw; batch ${batchNumber}`)

// const buildPaginationData = (batchNumber, step) => ({
//   limit: {
//     page: batchNumber + 1,
//     take: step,
//   },
//   order: {
//     by: 'id',
//     dir: 'asc',
//   },
// })

// const insertIsString = item => item.insert && typeof item.insert === 'string'

// const getRawFromDelta = value => {
//   const delta = R.pipe(
//     JSON.parse,
//     R.propOr([], 'ops'),
//     R.filter(insertIsString),
//     R.objOf('ops')
//   )(value)

//   return R.pipe(
//     convertDeltaToHtml,
//     stripHtml
//   )(delta)
// }

// const remapDeltaToRaw = R.pipe(
//   R.juxt([
//     R.pipe(
//       R.prop('question'),
//       getRawFromDelta,
//       R.objOf('raw_question')
//     ),
//     R.pipe(
//       R.prop('explanation'),
//       getRawFromDelta,
//       R.objOf('raw_explanation')
//     ),
//   ]),
//   R.mergeAll
// )

// const processBatch = async (batch, _, batchNumber) => {
//   log(batchNumber)

//   return mapP(
//     async flashcard => R.pipeWith(R.andThen)([
//       asAsync(remapDeltaToRaw),
//       async data => patch(flashcard.id, data),
//     ])(flashcard)
//   )(batch)
// }

// const nextBatch = async (batchNumber, step) => {
//   return R.pipeWith(R.andThen)([
//     async () => fetchCustom(
//       BookContentFlashcard.whereNotNull('id')
//     )([], buildPaginationData(batchNumber, step)),
//     R.prop('data'),
//     collectionToJson,
//   ])(true)
// }

// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// (
//   async (): Promise<void> => {
//     await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

//     console.log('Remap flashcards delta to raw finished.')
//     process.exit(0)
//   }
// )()
