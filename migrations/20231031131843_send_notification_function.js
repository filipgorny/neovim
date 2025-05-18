const dbfuncs = require('../src/database/upgrade-database-functions')

exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.raw(dbfuncs.upgradeGetTargetStudentsFunction())
  await knex.raw(dbfuncs.upgradeGetTargetStudentCoursesFunction())
  await knex.raw(dbfuncs.upgradeSendNotificationFunction())
}

const down = async knex => {
  await knex.raw(dbfuncs.dropSendNotificationFunction())
  await knex.raw(dbfuncs.dropGetTargetStudentCoursesFunction())
  await knex.raw(dbfuncs.dropGetTargetStudentsFunction())
}

