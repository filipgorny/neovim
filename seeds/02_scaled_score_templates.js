exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.scaled_score_templates VALUES ('48aee8d6-d310-405a-b9b8-f75493b27079', '118-132');
  `)
)
