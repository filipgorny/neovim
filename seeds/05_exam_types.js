exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.exam_types VALUES ('a3099d1b-0a9f-4a0b-906f-f485ffd6236a', 'full mcat', '{"section_1":600,"section_2":1800,"section_3":600}', 'full', 'mcat', 4, '{"section_1":"59","section_2":"53","section_3":"59","section_4":"59"}');
    INSERT INTO public.exam_types VALUES ('a8768807-1f62-471f-afb5-b52d085b40eb', 'mini bio', '{}', 'mini', 'bio', 1, '{"section_1":"59"}');
  `)
)
