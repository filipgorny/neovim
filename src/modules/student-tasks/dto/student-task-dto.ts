type StudentTaskDTO = {
  id?: string
  student_id: string
  task_id: string
  is_completed?: boolean
  completed_at?: Date
}

export const makeDTO = (
  student_id: string,
  task_id: string,
  is_completed?: boolean,
  completed_at?: Date
): StudentTaskDTO => ({
  student_id,
  task_id,
  is_completed: is_completed ?? false,
  completed_at: completed_at ?? null,
})

export default StudentTaskDTO
