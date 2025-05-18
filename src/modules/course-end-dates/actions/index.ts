import getCourseEndDatesForYear from './get-course-end-dates-for-year'
import createCourseEndDate from './create-course-end-date'
import modifyEndDate from './modify-end-date'
import modifyStartDate from './modify-start-date'
import modifyCalendarImageUrl from './modify-calendar-image-url'
import deleteCourseEndDate from './delete-course-end-date'
import deleteCourseEndDatesByCourseId from './delete-course-end-dates-by-course-id'
import checkCourseEndDateExists from './check-course-end-date-exists'
import getStudentsByCourseEndDate from './get-students-by-course-end-date'
import getCourseEndDatesByLiki from './get-course-end-dates-by-liki'
import getPossibleYearsForCourse from './get-possible-years-for-course'
import getAllCourseEndDates from './get-all-course-end-dates'
import modifyMeetingUrl from './modify-meeting-url'
import modifySemesterName from './modify-semester-name'
import fetchUpcomingClasses from './fetch-upcoming-classes'

export default {
  getCourseEndDatesForYear,
  createCourseEndDate,
  modifyEndDate,
  modifyStartDate,
  modifyCalendarImageUrl,
  deleteCourseEndDate,
  deleteCourseEndDatesByCourseId,
  checkCourseEndDateExists,
  getStudentsByCourseEndDate,
  getCourseEndDatesByLiki,
  getPossibleYearsForCourse,
  modifyMeetingUrl,
  getAllCourseEndDates,
  modifySemesterName,
  fetchUpcomingClasses,
}
