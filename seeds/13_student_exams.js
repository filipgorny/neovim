exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.student_exams VALUES ('f2a0bb1f-1ecd-4f50-9d9d-eeb24b05e94a', 'c201cfec-d738-407a-b79f-a4a18321bbf4', '83fdee0e-c865-4c60-9424-fb538e656ef1', '74eb8aa8-6d6e-4289-979a-82983e825ce7', 'MINI-BIO-1', 'BIO-1', '2021-08-30 10:34:54.657129+00', NULL, NULL, true, '{"summary":{"sectionCount":1,"minutes":95,"questions":59},"sections":[{"section":"Biology","amount":59,"sectionMinutes":95,"timeMultiplier":96.605}]}', 20, 'scheduled', NULL, NULL, true, NULL, NULL, '1.0', '{}', NULL, NULL, false, NULL, 'a8768807-1f62-471f-afb5-b52d085b40eb', '2021-08-29', NULL);
    INSERT INTO public.student_exams VALUES ('8a863f82-052f-45ef-8298-bce58b6b7aea', '12b6f889-2f74-4882-ba8d-86bf46dc5efb', '83fdee0e-c865-4c60-9424-fb538e656ef1', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'FULL-MCAT-1', 'EK-1', '2021-08-30 10:34:54.672834+00', NULL, NULL, true, '{"summary":{"sectionCount":4,"minutes":375,"questions":230},"sections":[{"section":"Physics","amount":59,"sectionMinutes":95,"timeMultiplier":96.605},{"section":"CARS","amount":53,"sectionMinutes":90,"timeMultiplier":101.887},{"section":"Biology","amount":59,"sectionMinutes":95,"timeMultiplier":96.605},{"section":"Psych","amount":59,"sectionMinutes":95,"timeMultiplier":96.605}]}', 20, 'scheduled', NULL, NULL, false, NULL, NULL, '1.0', '{"section_1":600,"section_2":1800,"section_3":600}', NULL, NULL, false, NULL, 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '2021-08-29', NULL);
  `)
)
