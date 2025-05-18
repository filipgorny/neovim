exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.admins VALUES ('be74108a-dfdc-42dc-ab53-4547f31594bf', 'e2e+admin@desmart.com', '$2a$10$Hu8K/oFRfwH5EU4UYsCfVuWhDtE0jmSj6LBIwlWWpw7.Wdz98BuA.', 'master_admin', true, NULL, NULL, NULL, 'Michael Raby', '2021-08-30 09:31:01.008+00');
  `)
)
