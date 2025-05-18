import { createStudentTask } from '../student-task-service'
import { find } from '../../tasks/tasks-repository'

export default async (student_id: string) => {
  // grab all tasks that have type onboarding and isActive true
  // create a studentTask for each of them
  // return the studentTasks

  const tasks = await find({
    limit: {},
    order: { dir: 'desc', by: 'created_at' },
  }, {
    type: 'getting-started',
    is_active: true,
  })

  return tasks.data.map(async (task: any) => createStudentTask(student_id, task.get('id')))
}
