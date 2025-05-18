import Joi from 'joi'
import { StopwatchState } from '../../stopwatch-state'

export const schema = Joi.object({
  state: Joi.string().valid(...Object.values(StopwatchState)).optional(),
  seconds: Joi.number().integer().positive().allow(0).optional(),
  date: Joi.string().optional(),
})
