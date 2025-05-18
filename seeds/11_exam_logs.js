exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.exam_logs VALUES ('41dc4574-7cc2-4016-948d-c50d3a3bbbd2', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'be74108a-dfdc-42dc-ab53-4547f31594bf', '2021-08-30 10:31:54.953523+00', 'created', NULL);
    INSERT INTO public.exam_logs VALUES ('f470b97b-35cc-4196-b6f8-103a3b07facd', '74eb8aa8-6d6e-4289-979a-82983e825ce7', 'be74108a-dfdc-42dc-ab53-4547f31594bf', '2021-08-30 10:32:30.740954+00', 'created', NULL);
  `)
)
