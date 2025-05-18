import orm from '../../../src/models'

const { knex } = orm.bookshelf

export const getStudentRank = (tableName: string) => async (student) => (
  knex({ t: tableName })
    .select('t.student_id', 't.score')
    .select(knex.raw(`
      (SELECT COUNT(DISTINCT r2.rank) 
      FROM (
        SELECT student_id, score, 
          RANK() OVER (ORDER BY score DESC) AS rank
        FROM ${tableName}
      ) r2
      WHERE r2.score > t.score
    ) + 1 AS overall_rank`))
    .where('t.student_id', student.id)
    .orderBy('t.score', 'desc')
    .limit(1)
)
