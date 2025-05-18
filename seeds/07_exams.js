exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.exams VALUES ('f7313eab-5fb9-4305-b861-50605aab0d76', '12b6f889-2f74-4882-ba8d-86bf46dc5efb', 'EK-1', 'FULL-PROD.xlsx', '2021-08-30 10:31:54.940846+00', 'be74108a-dfdc-42dc-ab53-4547f31594bf', true, 'FULL-MCAT-1', 20, '{"summary":{"sectionCount":4,"minutes":375,"questions":230},"sections":[{"section":"Physics","amount":59,"sectionMinutes":95,"timeMultiplier":96.605},{"section":"CARS","amount":53,"sectionMinutes":90,"timeMultiplier":101.887},{"section":"Biology","amount":59,"sectionMinutes":95,"timeMultiplier":96.605},{"section":"Psych","amount":59,"sectionMinutes":95,"timeMultiplier":96.605}]}', NULL, 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a');
    INSERT INTO public.exams VALUES ('74eb8aa8-6d6e-4289-979a-82983e825ce7', 'c201cfec-d738-407a-b79f-a4a18321bbf4', 'BIO-1', 'MINI-BIO.xlsx', '2021-08-30 10:32:30.732377+00', 'be74108a-dfdc-42dc-ab53-4547f31594bf', true, 'MINI-BIO-1', 20, '{"summary":{"sectionCount":1,"minutes":95,"questions":59},"sections":[{"section":"Biology","amount":59,"sectionMinutes":95,"timeMultiplier":96.605}]}', NULL, 'a8768807-1f62-471f-afb5-b52d085b40eb');
  `)
)
