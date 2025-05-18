import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentNotification } from './dto/student-notification-dto'
import { find } from './student-notifications-repository'

export const fetchNotificationsByStudentId = async (student_id: string, limit?: { page: number, take: number }): Promise<{ data: StudentNotification[], meta: any }> => {
  const result = await find({ limit: limit || { page: 1, take: 10 }, order: { by: 'created_at', dir: 'desc' } }, { student_id }, ['notification'])

  return {
    data: await mapP(async studentNotification => ({
      ...studentNotification.toJSON(),
      title: studentNotification.toJSON().notification.title,
      description_raw: studentNotification.toJSON().notification.description_raw,
      description_delta_object: studentNotification.toJSON().notification.description_delta_object,
      description_html: studentNotification.toJSON().notification.description_html,
      notification: undefined,
    }))(result.data),
    meta: result.meta,
  }
}
