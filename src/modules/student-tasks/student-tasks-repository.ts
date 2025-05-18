import { StudentTask } from '../../models'
import { _create, _patch, _patchWhere } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import StudentTaskDTO from './dto/student-task-dto'

const MODEL = StudentTask

export const create = async (dto: StudentTaskDTO) => (
  _create(MODEL)(dto)
)

export const patchWhere = async (where: {}, dto: {}) => (
  _patchWhere(MODEL)(where, dto)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const fetchStudentTasks = async (student_id: string) => {
  const result = await StudentTask.query(qb => {
    qb.where('student_id', student_id)
      .leftJoin('tasks', 'student_tasks.task_id', 'tasks.id')
      .orderBy('tasks.order', 'ASC')
  })
    .fetchAll({
      withRelated: [{
        task: qb => qb.select('id', 'name', 'content', 'order'),
      }],
    })

  // Convert to JSON and remove duplicates based on task_id
  const studentTasks = result.toJSON()
  const uniqueStudentTasks = studentTasks.filter((task, index, self) =>
    index === self.findIndex(t => t.task_id === task.task_id)
  )

  // Parse JSON content if needed
  return uniqueStudentTasks.map(studentTask => ({
    ...studentTask,
    task: {
      ...studentTask.task,
      content: JSON.stringify(studentTask.task.content),
    },
  }))
}

export const updateIsCompleted = async (id: string) => {
  const studentTask = await StudentTask.query(qb => {
    qb.where('id', id)
  }).fetch()

  if (!studentTask) {
    throw new Error('Student task not found')
  }

  const updatedStudentTask = await studentTask.save(
    { is_completed: !studentTask.get('is_completed') },
    { method: 'update', patch: true }
  )

  return updatedStudentTask
}
