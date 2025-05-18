exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.student_exam_scores VALUES ('bff7d675-1a83-4e37-a528-e25ac24ed9ea', 'a8768807-1f62-471f-afb5-b52d085b40eb', '[{"name":"total","order":0,"target_score":132,"pts":132},{"name":"section_1","order":1,"target_score":132,"pts":132}]', '83fdee0e-c865-4c60-9424-fb538e656ef1', true);
    INSERT INTO public.student_exam_scores VALUES ('47b5f56d-bc57-4f34-8f6d-788201c32961', 'a3099d1b-0a9f-4a0b-906f-f485ffd6236a', '[{"name":"total","order":0,"target_score":528,"pts":528},{"name":"section_1","order":1,"target_score":132,"pts":132},{"name":"section_2","order":2,"target_score":132,"pts":132},{"name":"section_3","order":3,"target_score":132,"pts":132},{"name":"section_4","order":4,"target_score":132,"pts":132}]', '83fdee0e-c865-4c60-9424-fb538e656ef1', true);
  `)
)
