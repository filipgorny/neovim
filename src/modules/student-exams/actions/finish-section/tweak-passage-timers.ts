import * as R from 'ramda'
import mapP from '../../../../../utils/function/mapp'
import { findOneOrFail as findSection } from '../../../student-exam-sections/student-exam-section-repository'
import { patch as patchPassage } from '../../../student-exam-passages/student-exam-passage-repository'

const sumQwtPerPassage = R.map(
  R.pipe(
    R.prop('questions'),
    // @ts-ignore
    R.pluck('working'),
    R.sum
  )
)

const extractPassages = R.pipe(
  R.prop('passages'),
  // @ts-ignore
  R.sortBy(
    R.prop('order')
  )
)

const extractPwtFromPassages = R.pluck('working')
const extractPrtFromPassages = R.pluck('reading')

const sumQWTAndPRT = (qwts, prts) => (
  R.addIndex(R.map)(
    // @ts-ignore
    (qwtSum, index) => R.add(prts[index], qwtSum)
  )(qwts)
)

const tweakPwts = properPwts => async passages => (
  R.addIndex(mapP)(
    // @ts-ignore
    async (passage, index) => (
      // @ts-ignore
      patchPassage(passage.id, {
        // @ts-ignore
        working: properPwts[index],
      })
    )
  )(passages)
)

export const tweakPassageTimers = async (sectionId: string) => {
  const section = await findSection({ id: sectionId }, ['passages.questions'])
  // @ts-ignore
  const passages = extractPassages(section)

  // @ts-ignore
  const qwtSums = sumQwtPerPassage(passages)
  // @ts-ignore
  const pwts = extractPwtFromPassages(passages)
  // @ts-ignore
  const prts = extractPrtFromPassages(passages)

  const qwtAndPrt = sumQWTAndPRT(qwtSums, prts)

  await tweakPwts(qwtAndPrt)(passages)
}
