import * as R from 'ramda'
import { User } from '../../../models'
import { throwException, resourceAlreadyExistsException, notFoundException } from '../../../../utils/error/error-factory'
import asAsync from '../../../../utils/function/as-async'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import validatePassword from '../validation/validate-password'
import { schema } from '../validation/schema/create-user-schema'
import dispatchEmailVerificationNotification from '../../../../services/notification/dispatch-email-verification-notification'
import { findOne as findStudent, create as createStudent, update as updateStudent } from '../../students/student-repository'
import { UserRoleEnum } from '../user-roles'
import { isFreeTrialStudent } from '../../student-courses/student-course-service'
import { makeDTO } from '../../students/dto/student-dto'
import { earnSaltyBucksForRegisteringAsLibertus, earnSaltyBucksForRegisteringAsPatrician, earnSaltyBucksForRegisteringAsPlebeian } from '../../../../services/salty-bucks/salty-buck-service'

const NORMAL_USER_DEFAULT_NAME = 'Gladiator Gamer'
const NORMAL_USER_DEFAULT_PHONE_NUMBER = '123-456-7890'

const userExists = async email => {
  try {
    await User.where(({ email })).fetch()

    return true
  } catch (e) {
    return false
  }
}

const validateUserExistence = R.pipeWith(R.andThen)([
  asAsync(R.prop('email')),
  userExists,
  R.when(
    R.equals(true),
    () => throwException(resourceAlreadyExistsException('User'))
  ),
])

const createUser = async (payload, user_role) => {
  const instance = await User.forge({
    email: payload.email,
    password: payload.password,
    email_verification_token: payload.email_verification_token,
    user_role,
  }).save()

  await dispatchEmailVerificationNotification(instance.toJSON(), payload.link)

  return instance
}

const isActiveStudent = R.pipe(
  R.juxt([
    R.pipe(
      R.prop('is_active'),
      R.equals(true)
    ),
    R.pipe(
      R.prop('is_student'),
      R.equals(true)
    ),
  ]),
  R.all(R.identity)
)

export default async payload => {
  validateEntityPayload(schema)(payload)
  validatePassword(payload.password)

  await validateUserExistence(payload)

  let student = await findStudent({ email: payload.email })
  let userRole
  if (isActiveStudent(student)) {
    const isFreeTrial = await isFreeTrialStudent(student.id)
    if (isFreeTrial) {
      userRole = UserRoleEnum.plebeian
    } else {
      userRole = UserRoleEnum.patrician
    }
  } else {
    userRole = UserRoleEnum.libertus
    if (student) {
      await updateStudent(student.id, { is_student: false, deleted_at: null })
    }
    student = await createStudent(makeDTO(payload.email, NORMAL_USER_DEFAULT_NAME, NORMAL_USER_DEFAULT_PHONE_NUMBER, 0, false))
  }

  const result = await createUser(payload, userRole)

  switch (userRole) {
    case UserRoleEnum.patrician:
      await earnSaltyBucksForRegisteringAsPatrician(student.id, result.id)
      break
    case UserRoleEnum.plebeian:
      await earnSaltyBucksForRegisteringAsPlebeian(student.id, result.id)
      break
    case UserRoleEnum.libertus:
      await earnSaltyBucksForRegisteringAsLibertus(student.id, result.id)
      break
  }

  return result
}
