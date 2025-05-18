import StudentTaskDTO, { makeDTO } from './dto/student-task-dto'
import { create, patchWhere } from './student-tasks-repository'

export const createStudentTask = async (
  student_id: string,
  task_id: string
): Promise<StudentTaskDTO> => {
  return create(makeDTO(student_id, task_id, false, null))
}

export const resetStudentTasks = async (student_id: string) => (
  patchWhere({ student_id }, {
    is_completed: false,
    completed_at: null,
  })
)
