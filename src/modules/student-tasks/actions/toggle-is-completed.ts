
import { updateIsCompleted } from '../student-tasks-repository'

export default async (student_task_id: string) => {
  return await updateIsCompleted(student_task_id)
}
