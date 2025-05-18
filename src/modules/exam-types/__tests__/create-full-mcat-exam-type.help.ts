import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import createExamType from '../actions/create-exam-type'
import { schema as createExamTypeSchema } from '../validation/schema/create-exam-type-schema'

export const createFullMcatExamType = async (title: string) => {
  const payload = {
    title,
    type: 'full',
    subtype: 'mcat',
    sectionCount: 4,
    questionAmount: [{ order: 1, value: 59 }, { order: 2, value: 53 }, { order: 3, value: 59 }, { order: 4, value: 59 }],
    examLength: [{ order: 1, value: 95 }, { order: 2, value: 90 }, { order: 3, value: 95 }, { order: 4, value: 95 }],
    breakDefinition: [{ order: 1, value: 600 }, { order: 2, value: 1800 }, { order: 3, value: 600 }],
    introPages: [
      { order: 1, raw: 'test 1', delta_object: { ops: [{ insert: 'test 1' }] } },
      { order: 2, raw: 'test 2', delta_object: { ops: [{ insert: 'test 2' }] } },
      { order: 3, raw: 'test 3', delta_object: { ops: [{ insert: 'test 3' }] } },
      { order: 4, raw: 'test 4', delta_object: { ops: [{ insert: 'test 4' }] } },
    ],
    sectionTitles: [
      { order: 1, value: 'Section 1' },
      { order: 2, value: 'Section 2' },
      { order: 3, value: 'Section 3' },
      { order: 4, value: 'Section 4' },
    ],
    scaledScoreRanges: [
      { order: 1, value: [118, 132] },
      { order: 2, value: [118, 132] },
      { order: 3, value: [118, 132] },
      { order: 4, value: [118, 132] },
    ],
  }
  validateEntityPayload(createExamTypeSchema)(payload)

  return createExamType(payload)
}
