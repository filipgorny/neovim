import moment from 'moment'
import { syncCourse } from '../../../courses/course-service'
import attachProducts from '../../../students/actions/attach-products'
import { findOne as findStudent } from '../../../students/student-repository'

type Payload = {
  student_id: string,
  course_external_id: string,
  expires_at: string,
  transaction_id: string,
}

export default async (payload: Payload) => {
  const student = await findStudent({ id: payload.student_id })
  const data = {
    courses: [{
      external_id: payload.course_external_id,
      external_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      type: 'live_course',
      transaction_id: payload.transaction_id,
      metadata: {
        expires_at: payload.expires_at,
      },
    }],
  }

  // @ts-ignore
  return attachProducts(student, data)
}
