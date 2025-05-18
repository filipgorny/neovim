exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.exam_sections VALUES ('2c8104fb-9bab-4c52-88c6-aeae0ac8f6dd', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'Physics', 1, 'Chemical and Physical Foundations of Biological Systems 1:26');
    INSERT INTO public.exam_sections VALUES ('47673b61-a9cc-42d4-9d67-b0008386c398', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'CARS', 2, 'Critical Analysis and Reasoning Skills');
    INSERT INTO public.exam_sections VALUES ('df41aa1b-258a-47b3-9de1-c89c5e4da9e2', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'Biology', 3, 'Biological and Biochemical Foundations of Living Systems');
    INSERT INTO public.exam_sections VALUES ('55fd5c2a-b713-4a44-8c69-ccb226c4dec3', 'f7313eab-5fb9-4305-b861-50605aab0d76', 'Psych', 4, 'Psychological, Social, and Biological Foundations of Behavior');
    INSERT INTO public.exam_sections VALUES ('8a697fba-5ba4-4d1b-a4e9-b50738678fb2', '74eb8aa8-6d6e-4289-979a-82983e825ce7', 'Biology', 1, 'Chemical and Physical Foundations of Biological Systems');
  `)
)
