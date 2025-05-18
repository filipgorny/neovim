exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.scaled_scores VALUES ('cd7e3a87-e4aa-46ed-bcbd-be27b4293391', '48aee8d6-d310-405a-b9b8-f75493b27079', 1, 118, '0.01');
    INSERT INTO public.scaled_scores VALUES ('0a2ec46f-731e-4223-8c4a-11c7109126df', '48aee8d6-d310-405a-b9b8-f75493b27079', 2, 119, '0.03');
    INSERT INTO public.scaled_scores VALUES ('196344d0-d309-4d9f-acad-3e50d43c0652', '48aee8d6-d310-405a-b9b8-f75493b27079', 3, 120, '0.06');
    INSERT INTO public.scaled_scores VALUES ('a908018f-c615-4bc6-9cd2-fcb62b9507d1', '48aee8d6-d310-405a-b9b8-f75493b27079', 4, 121, '0.12');
    INSERT INTO public.scaled_scores VALUES ('81cedff4-8c3f-4d3f-9f5d-6f37c1121867', '48aee8d6-d310-405a-b9b8-f75493b27079', 5, 122, '0.21');
    INSERT INTO public.scaled_scores VALUES ('74c10b9c-6d3e-4d10-be3e-3418fbd5f836', '48aee8d6-d310-405a-b9b8-f75493b27079', 6, 123, '0.31');
    INSERT INTO public.scaled_scores VALUES ('b069fe24-d166-424d-8616-886c9c25ba4c', '48aee8d6-d310-405a-b9b8-f75493b27079', 8, 125, '0.53');
    INSERT INTO public.scaled_scores VALUES ('64ea3994-bf22-4505-8590-7bfa1df54ad9', '48aee8d6-d310-405a-b9b8-f75493b27079', 7, 124, '0.43');
    INSERT INTO public.scaled_scores VALUES ('5ff0d0e6-f371-4b9a-93d5-f17968491b97', '48aee8d6-d310-405a-b9b8-f75493b27079', 9, 126, '0.65');
    INSERT INTO public.scaled_scores VALUES ('af84c890-5f46-4742-9133-adf7ebe6c51c', '48aee8d6-d310-405a-b9b8-f75493b27079', 12, 129, '0.91');
    INSERT INTO public.scaled_scores VALUES ('3f0a7dc1-f1a6-4957-bae9-3448413275fe', '48aee8d6-d310-405a-b9b8-f75493b27079', 10, 127, '0.76');
    INSERT INTO public.scaled_scores VALUES ('1738bcb8-16e4-4bd1-aa88-a23aa3f5670a', '48aee8d6-d310-405a-b9b8-f75493b27079', 11, 128, '0.85');
    INSERT INTO public.scaled_scores VALUES ('bcedc33f-5ee9-4a86-bdf1-1b311162a17f', '48aee8d6-d310-405a-b9b8-f75493b27079', 15, 132, '1');
    INSERT INTO public.scaled_scores VALUES ('0bd6d4ef-17aa-4223-bb94-10e7f9b9f2a5', '48aee8d6-d310-405a-b9b8-f75493b27079', 13, 130, '0.97');
    INSERT INTO public.scaled_scores VALUES ('242088f6-109f-4f72-a277-cafa7acb220f', '48aee8d6-d310-405a-b9b8-f75493b27079', 14, 131, '0.99');
  `)
)
