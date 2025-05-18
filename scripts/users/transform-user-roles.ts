import orm from '../../src/models'

const { knex } = orm.bookshelf;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    await knex.raw("UPDATE users SET user_role = 'plebeian' WHERE user_role = 'free_trial' ;")
    await knex.raw("UPDATE users SET user_role = 'libertus' WHERE user_role = 'normal_user';")

    console.log('Replaced all user roles free_trial with plebeian and normal_user with libertus')
    process.exit(0)
  }
)()
