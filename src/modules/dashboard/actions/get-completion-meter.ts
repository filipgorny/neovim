import { calculateOilLevelByStudentCourse } from '../../../../services/completion-meter/oil-service'
import { calculateMileageByStudentCourse } from '../../../../services/completion-meter/mileage-service'
import { calculateVelocityByStudentCourse } from '../../../../services/completion-meter/velocity-service'
import { fetchTemperatureByStudentCourse } from '../../../../services/completion-meter/temperature-service'
import { calculateAccelerationByStudentCourse } from '../../../../services/completion-meter/acceleration-service'
import { migrateVideosToStudentBookVideos } from '../../student-book-videos/student-book-videos-service'

export default async (student, studentCourse) => {
  if (!studentCourse.videos_migrated) {
    setTimeout(migrateVideosToStudentBookVideos(studentCourse), 0)
  }

  const [oil, mileage, velocity, temperature] = await Promise.all([
    calculateOilLevelByStudentCourse(studentCourse),
    calculateMileageByStudentCourse(student, studentCourse),
    calculateVelocityByStudentCourse(studentCourse),
    fetchTemperatureByStudentCourse(studentCourse),
  ])

  const acceleration = await calculateAccelerationByStudentCourse(studentCourse, velocity.average_velocity)

  return {
    oil,
    mileage,
    velocity,
    temperature,
    acceleration,
  }
}
