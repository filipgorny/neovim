import { findFirstScoreNumber } from '../find-first-score-number'

describe('findFirstScoreNumber', () => {
  it('should return null when input is not an array', () => {
    expect(findFirstScoreNumber(null as any)).toBeNull()
    expect(findFirstScoreNumber(undefined as any)).toBeNull()
    expect(findFirstScoreNumber({} as any)).toBeNull()
  })

  it('should return null when array is empty', () => {
    expect(findFirstScoreNumber([])).toBeNull()
  })

  it('should return null when no items have score_number', () => {
    const input = [
      { other: 1 },
      { score: '10' },
      { something: 'else' },
    ]
    expect(findFirstScoreNumber(input)).toBeNull()
  })

  it('should return the first score_number found in the array', () => {
    const input = [
      { other: 1 },
      { score_number: 10 },
      { score_number: 20 },
    ]
    expect(findFirstScoreNumber(input)).toBe(10)
  })

  it('should handle undefined items in array', () => {
    const input = [
      undefined,
      null,
      { score_number: 30 },
    ]
    expect(findFirstScoreNumber(input)).toBe(30)
  })

  it('should handle mixed-type items in array', () => {
    const input = [
      {
        query: 'What is the primary function of Very Low-Density Lipoproteins (VLDLs) in the body? they are responsible for energy transport',
      },
      {
        original_quiz_question: 'What is the primary function of Very Low-Density Lipoproteins (VLDLs) in the body?',
        score_expected_answer: 'VLDLs are made in the liver and transport endogenous lipids and cholesterol from the liver to adipose and muscle tissue. As VLDLs lose TAGs they become VLDL remnants called IDLs, which are taken up by the liver or further metabolized to LDLs.',
        score_explanation: "User, your answer that VLDLs are responsible for energy transport is partially correct but lacks specificity and detail. VLDLs primarily transport endogenous lipids, including triglycerides and cholesterol, from the liver to adipose and muscle tissues, not just for energy transport. It's important to understand the specific roles and types of lipids they transport, as well as their destinations, to fully grasp their function in lipid metabolism. Keep in mind the detailed process of how VLDLs evolve into IDLs and then LDLs as they lose triglycerides. This understanding is crucial for the MCAT.",
        score_number: 60,
        follow_up_quiz_question: 'Describe the process by which VLDLs are converted into LDLs in the body.',
      },
      "User, your answer that VLDLs are responsible for energy transport is partially correct but lacks specificity and detail. VLDLs primarily transport endogenous lipids, including triglycerides and cholesterol, from the liver to adipose and muscle tissues, not just for energy transport. It's important to understand the specific roles and types of lipids they transport, as well as their destinations, to fully grasp their function in lipid metabolism. Keep in mind the detailed process of how VLDLs evolve into IDLs and then LDLs as they lose triglycerides. This understanding is crucial for the MCAT. **Your score for this answer is 60 out of 100.**\n\nTo further your understanding, here's a follow-up question: Describe the process by which VLDLs are converted into LDLs in the body.",
    ]
    expect(findFirstScoreNumber(input)).toBe(60)
  })
})
