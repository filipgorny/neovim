import { fetchStudentTasks } from '../student-tasks-repository'

export default async (instance) => (
  fetchStudentTasks(instance.get('id'))
)
