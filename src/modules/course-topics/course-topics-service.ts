import { CourseTopic, CourseTopicDTO } from '../../types/course-topic-type'
import { create, patch, deleteRecord, findOneOrFail, fixBookContentOrderAfterDeleting, deleteWhere, findParentOfCourseTopic, findAllChildrenOfCourseTopic } from './course-topics-repository'

export const createEntity = async (dto: CourseTopicDTO): Promise<CourseTopic> => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}): Promise<CourseTopic> => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => {
  const entity = await findOneOrFail({ id })
  const result = await deleteRecord(id)

  await fixBookContentOrderAfterDeleting(entity.course_id, entity.order)

  return result
}

export const deleteAllByCourseId = async (course_id: string) => (
  deleteWhere({ course_id })
)

export const findAllParentsOfCourseTopic = async (id: string) => {
  const parent = await findParentOfCourseTopic(id)

  if (parent) {
    return [parent, ...await findAllParentsOfCourseTopic(parent.id)]
  } else {
    return []
  }
}

export const findCourseTopicWithAllParents = async (id: string) => (
  [await findOneOrFail({ id }), ...await findAllParentsOfCourseTopic(id)]
)

export const findCourseTopicWithAllChildren = async (id: string) => (
  [await findOneOrFail({ id }), ...await findAllChildrenOfCourseTopic(id)]
)
