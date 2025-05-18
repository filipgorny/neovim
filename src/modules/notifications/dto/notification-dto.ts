import { RecurringEventDefinition } from '../../../../services/recurring-events/recurring-events-service'
import { NotificationType } from '../notification-type'
import { StudentGroup } from '../student-group-types'

export type NotificationDTO = {
  type: NotificationType
  author_id: string
  title: string
  description_raw: string
  description_delta_object: string
  description_html: string
  student_groups: StudentGroup[] | string
  scheduled_for?: string
  recurring_definition?: RecurringEventDefinition | string
  deleted_at?: string
}

export type ModifiedNotificationDTO = Omit<NotificationDTO, 'scheduled_for'> & { broken_scheduled_for?: string }

export type Notification = { id: string } & NotificationDTO

export const makeDTO = (
  type: NotificationType,
  author_id: string,
  title: string,
  description_raw: string,
  description_delta_object: string,
  description_html: string,
  student_groups: StudentGroup[] | string,
  scheduled_for?: string,
  recurring_definition?: RecurringEventDefinition | string
): NotificationDTO => ({
  type,
  author_id,
  scheduled_for,
  title,
  description_raw,
  description_delta_object,
  description_html,
  student_groups: typeof student_groups === 'string' ? student_groups : JSON.stringify(student_groups),
  recurring_definition: typeof recurring_definition === 'string' ? recurring_definition : JSON.stringify(recurring_definition),
})

export default NotificationDTO
