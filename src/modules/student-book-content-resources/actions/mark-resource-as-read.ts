import * as R from 'ramda'
import { earnSaltyBucksForResource } from '../../../../services/salty-bucks/salty-buck-service'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'
import { checkIfSpecifiedBookContentResourceExist, findOneOrFail } from '../student-book-content-resource-repository'
import { markBookContentResourceAsRead } from '../student-book-content-resource-service'
import { StudentCourse } from '../../../types/student-course'

const validateResourceExistence = async (studentId: string, resourceId: string) => {
  const isExistingResource = await checkIfSpecifiedBookContentResourceExist(resourceId, studentId)

  if (!isExistingResource) {
    throwException(notFoundException('StudentBookContentResource'))
  }
}

const isAlreadyRead = R.propEq('is_read', true)

export default async (studentId: string, resourceId: string, studentCourse: StudentCourse) => {
  await validateResourceExistence(studentId, resourceId)

  const resource = await findOneOrFail({ id: resourceId }, [])

  if (isAlreadyRead(resource)) {
    return true
  }

  await markBookContentResourceAsRead(resourceId)

  return earnSaltyBucksForResource(studentId, resource, studentCourse)
}
