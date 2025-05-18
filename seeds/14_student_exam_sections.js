exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.student_exam_sections VALUES ('65425c2a-7aeb-45a9-8725-a08879e721a2', 'f2a0bb1f-1ecd-4f50-9d9d-eeb24b05e94a', 'Biology', 1, 'phase_1', true, false, 'Chemical and Physical Foundations of Biological Systems');
    INSERT INTO public.student_exam_sections VALUES ('0df5ea42-737a-49b4-be94-e3cc210e27c7', '8a863f82-052f-45ef-8298-bce58b6b7aea', 'Physics', 1, 'review', false, true, 'Chemical and Physical Foundations of Biological Systems 1:26');
    INSERT INTO public.student_exam_sections VALUES ('34d6b0ec-19d1-4cd1-ad4e-7cd023ba82c7', '8a863f82-052f-45ef-8298-bce58b6b7aea', 'CARS', 2, 'review', true, true, 'Critical Analysis and Reasoning Skills');
    INSERT INTO public.student_exam_sections VALUES ('971f5a5e-7214-4b26-bc74-b3838be2ee60', '8a863f82-052f-45ef-8298-bce58b6b7aea', 'Biology', 3, 'review', true, true, 'Biological and Biochemical Foundations of Living Systems');
    INSERT INTO public.student_exam_sections VALUES ('79d8b869-a0be-411e-afcd-64bc9a7e9e41', '8a863f82-052f-45ef-8298-bce58b6b7aea', 'Psych', 4, 'review', true, true, 'Psychological, Social, and Biological Foundations of Behavior');
  `)
)
