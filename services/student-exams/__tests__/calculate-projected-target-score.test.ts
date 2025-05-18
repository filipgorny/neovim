import { calculateProjectedTargetScore, extractExamScores } from '../calculate-projected-target-score'

jest.mock('../../../src/modules/settings/settings-service.ts')

/**
 * Calculates PTS based on a sequence of scores from the exams already taken (for a single section)
 */

describe('calculate-projected-target-score', () => {
  it('three exams taken', async () => {
    const scores = [118, 120, 121]
    const result = await calculateProjectedTargetScore(scores)
    const expected = 125

    expect(result).toBe(expected)
  })

  it('five exams taken', async () => {
    const scores = [119, 121, 122, 122, 123]
    const result = await calculateProjectedTargetScore(scores)
    const expected = 124

    expect(result).toBe(expected)
  })

  it('one exams taken - no change in prediction since we know nothing about progress', async () => {
    const scores = [124]
    const result = await calculateProjectedTargetScore(scores)
    const expected = 124

    expect(result).toBe(expected)
  })

  it('no exams taken', async () => {
    const scores = []
    const result = await calculateProjectedTargetScore(scores)
    const expected = 118

    expect(result).toBe(expected)
  })

  it('five exams taken, two excluded (shorter distance to real MCAT)', async () => {
    const scores = [121, 124, 126]
    const result = await calculateProjectedTargetScore(scores, 2)
    const expected = 128

    expect(result).toBe(expected)
  })

  it('four exams taken, one excluded (shorter distance to real MCAT)', async () => {
    const scores = [118, 118, 119, 119]
    const result = await calculateProjectedTargetScore(scores, 1)
    const expected = 119

    expect(result).toBe(expected)
  })

  it('extracts section scores from all exams', async () => {
    const exams = [
      {
        is_excluded_from_pts: false,
        exam_length: '{"summary":{"sectionCount":4,"minutes":375,"questions":230}}',
        scores: '{"sections":[{"id":"704a0bf3-7b45-4d8f-a6d8-52979037e47a","title":"CHEMISTRY PHYSICS","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":118,"percentile_rank":0},{"id":"4f10bcfb-9077-421f-bbc9-fc94f215955a","title":"CARS","amount_correct":0,"total_amount":53,"percentage_correct":0,"scaled_score":118,"percentile_rank":0},{"id":"8805764e-6782-42eb-89e7-d994db651471","title":"Biology","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":122,"percentile_rank":0},{"id":"e97cbc82-df11-4a69-a278-5324cbe4caa0","title":"Psych Soc","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":118,"percentile_rank":0}],"exam":{"scaled_score":472,"percentile_rank":"0.01"}}',
      },
      {
        is_excluded_from_pts: false,
        exam_length: '{"summary":{"sectionCount":4,"minutes":375,"questions":230}}',
        scores: '{"sections":[{"id":"704a0bf3-7b45-4d8f-a6d8-52979037e47a","title":"CHEMISTRY PHYSICS","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":122,"percentile_rank":0},{"id":"4f10bcfb-9077-421f-bbc9-fc94f215955a","title":"CARS","amount_correct":0,"total_amount":55,"percentage_correct":0,"scaled_score":118,"percentile_rank":0},{"id":"8805764e-6782-42eb-89e7-d994db651471","title":"Biology","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":118,"percentile_rank":0},{"id":"e97cbc82-df11-4a69-a278-5324cbe4caa0","title":"Psych Soc","amount_correct":0,"total_amount":59,"percentage_correct":0,"scaled_score":123,"percentile_rank":0}],"exam":{"scaled_score":472,"percentile_rank":"0.01"}}',
      },
    ]

    const result = await extractExamScores(exams)

    const expected = [
      [118, 122],
      [118, 118],
      [122, 118],
      [118, 123],
    ]

    expect(result).toEqual(expected)
  })

  it('returns max 132', async () => {
    const scores = [118, 119, 131]
    const result = await calculateProjectedTargetScore(scores)
    const expected = 132

    expect(result).toBe(expected)
  })

  it('returns min 118', async () => {
    const scores = [132, 119]
    const result = await calculateProjectedTargetScore(scores)
    const expected = 118

    expect(result).toBe(expected)
  })
})
