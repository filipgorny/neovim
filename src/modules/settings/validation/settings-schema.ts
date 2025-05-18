import Joi from 'joi'

export const schema = Joi.object({
  // amount of days the exam should be accessible by the student
  defaultExamAccessPeriod: Joi.number().integer().positive(),
  // amount of significant exams after which we calculate different values (e.g. PTS)
  examAmountThreshold: Joi.number().integer().positive(),
  // mimimum amount of finished exams before calculating percentile ranks and showing students their scores
  minimumExamsTakenForShowingScores: Joi.number().integer().positive(),
  // salty bucks starting balance for student account
  saltyBucksStartingBalance: Joi.number().integer().positive(),
})
