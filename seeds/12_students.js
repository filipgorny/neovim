exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.students VALUES ('83fdee0e-c865-4c60-9424-fb538e656ef1', 'Amanda Jones', 'e2e+student@examkrackers.com', '2021-08-30 10:34:54.197+00', true, '514-688-8955', false, true, 0, null, null, null, 'front', false);
  `)
)
