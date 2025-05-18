exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.exam_type_scaled_score_templates VALUES ('3b102594-48be-4b87-8035-589662eac738', 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '48aee8d6-d310-405a-b9b8-f75493b27079', 1);
    INSERT INTO public.exam_type_scaled_score_templates VALUES ('47670e93-e364-480d-9985-e8908a889fe5', 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '48aee8d6-d310-405a-b9b8-f75493b27079', 3);
    INSERT INTO public.exam_type_scaled_score_templates VALUES ('2420bb07-b281-4ee1-9f39-c4184c8043ea', 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '48aee8d6-d310-405a-b9b8-f75493b27079', 2);
    INSERT INTO public.exam_type_scaled_score_templates VALUES ('26d304fb-b06c-40da-8ccf-de02837e2ba4', 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '48aee8d6-d310-405a-b9b8-f75493b27079', 4);
    INSERT INTO public.exam_type_scaled_score_templates VALUES ('c400871b-986a-4969-8142-9357d2d48b83', 'a8768807-1f62-471f-afb5-b52d085b40eb', '48aee8d6-d310-405a-b9b8-f75493b27079', 1);
  `)
)
