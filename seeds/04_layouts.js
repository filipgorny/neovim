exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.layouts VALUES ('12b6f889-2f74-4882-ba8d-86bf46dc5efb', 'full-mcat');
    INSERT INTO public.layouts VALUES ('c201cfec-d738-407a-b79f-a4a18321bbf4', 'mini-bio');
  `)
)
