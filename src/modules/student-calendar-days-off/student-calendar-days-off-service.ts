import { StudentCalendarDayOff } from '../../types/student-calendar-day-off'
import { create, patch, deleteRecord, deleteWhere, findOne } from './student-calendar-days-off-repository'

export const createDayOff = async (dto: Omit<StudentCalendarDayOff, 'id'>) => {
  const dayOff = await findOne({ day_off_date: dto.day_off_date, student_course_id: dto.student_course_id })

  return dayOff || create(dto)
}

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteDayOff = async (student_course_id: string, id: string) => {
  const dayOff = await findOne({ id, student_course_id })

  if (dayOff) {
    await deleteRecord(id)
  }

  return true
}

export const deleteDaysOffByStudentCourseId = async (student_course_id: string) => (
  deleteWhere({ student_course_id })
)
