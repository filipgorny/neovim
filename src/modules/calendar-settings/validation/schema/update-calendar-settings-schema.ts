import Joi from 'joi'
import { CalendarExamFrequency } from '../../calendar-exam-frequency'

export const schema = Joi.object({
  preferred_days_full_length_exam: Joi.array().items(
    Joi.number().integer().min(0).max(6)
  ),
  preferred_days_section_exam: Joi.array().items(
    Joi.number().integer().min(0).max(6)
  ),
  full_length_exam_frequency: Joi.string().valid(CalendarExamFrequency.everyWeek, CalendarExamFrequency.everyOtherWeek),
  section_exam_frequency: Joi.string().valid(CalendarExamFrequency.everyWeek, CalendarExamFrequency.everyOtherWeek),
  chapter_exam_delay: Joi.number().integer(),
  preferred_days_chapters: Joi.array().items(
    Joi.number().integer().min(0).max(6)
  ),
})
