export const filterByCourse = (studentCourseId) => studentCourseId ? `and sb.course_id = '${studentCourseId}'` : ''
