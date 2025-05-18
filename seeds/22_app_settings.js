exports.seed = async knex => up(knex)

const up = knex => (
  knex.raw(`
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('92894458-447d-46f7-8fd4-d649e2e4a868','salty_bucks','open_new_mcat_think','1'),
      ('bd87ba01-e680-44d4-b724-a86250add6ff','salty_bucks','answer_question_default_exam','10'),
      ('15a4c27e-b582-4ad2-bf3e-325b95e7d822','salty_bucks','complete_default_exam','1000'),
      ('ce64bd5b-2723-47a9-87f3-18848812d645','salty_bucks','review_question_default_exam','3'),
      ('47752679-ab7e-4398-8d8b-0a128b9090f7','salty_bucks','multiplier_test_question_default_exam','2.0'),
      ('0291b51f-27d6-4083-9c0c-c2df34752f60','salty_bucks','answer_question_full_mcat','10'),
      ('fa4fc009-093b-4ce9-8e45-69ed9662c800','salty_bucks','multiplier_test_question_full_mcat','2.0'),
      ('44d2e180-efe3-496d-ae7f-eff5a9840026','support_tab','share_with_community_link','http://examkrackers.com/2'),
      ('2329ad59-2772-4c31-befa-c38a610b9c4b','salty_bucks','active_on_site_30min','25'),
      ('44d2e180-efe3-496d-ae7f-eff5a9840025','support_tab','training_tutorials_link','http://www.examkrackers.com/1');
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('44d2e180-efe3-496d-ae7f-eff5a9840029','support_tab','contact_us_link','http://examkrackers.com/5'),
      ('44d2e180-efe3-496d-ae7f-eff5a9840028','support_tab','help_center_link','http://examkrackers.com/3'),
      ('3d8aba27-7ee3-40b1-af47-4ae290152225','salty_bucks','review_question_full_mcat','5'),
      ('71899038-8103-4fd2-abe9-0b8364ca2abe','salty_bucks','multiplier_answer_content_question_correct','1.0'),
      ('d0e88304-69ec-4ccf-a34a-e677141ada6a','salty_bucks','reset_chapter_content_questions','200'),
      ('26598fb8-d7da-4a7e-841c-979c678eec03','salty_bucks','reset_single_content_question','120'),
      ('784d186c-425d-4da7-b579-e520bde93b53','salty_bucks','open_new_clinical_context','1'),
      ('44d2e180-efe3-496d-ae7f-eff5a9840030','support_tab','getting_started_link','http://examkrackers.com'),
      ('0d22c21b-3477-4ea9-bb6e-9b29a8bcb071','salty_bucks','complete_book_section','100'),
      ('d462b343-a750-4382-ab45-38d9a16890b5','salty_bucks','complete_chapter','1000');
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('179dfbe2-7566-4c61-9662-428370221e21','salty_bucks','complete_book','5000'),
      ('4d58c3eb-5c95-48fa-8493-728e95597704','salty_bucks','complete_course','10000'),
      ('b4b37f39-9e31-4938-9813-328a932714f7','salty_bucks','open_new_tmi','1'),
      ('1bcf8d16-b268-4c46-aae9-ae99098c89d1','salty_bucks','watch_all_videos_in_chapter','500'),
      ('0f3c3e9e-0691-482f-8655-47c66e0077a4','salty_bucks','watch_all_videos_in_book','2000'),
      ('2f924415-4fe1-4509-b82d-e8100bd02112','salty_bucks','flashcard_increase_p_level','2'),
      ('8a7d6ca5-38d0-4340-9367-89922a43e16c','salty_bucks','answer_content_question','5'),
      ('a2993742-00d7-4a06-b77c-3629bbe09129','salty_bucks','complete_chapter_quiz_mini_mcat','200'),
      ('b6f373cb-8cab-4316-83ac-7141d8022d5b','salty_bucks','answer_chapter_quiz_question_mini_mcat','10'),
      ('5380a98b-b02a-4994-85c9-5d9143a5b36d','salty_bucks','multiplier_chapter_quiz_question_mini_mcat','3');
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('a84bd38d-3dd7-4ba4-85c4-18999aa95f48','salty_bucks','review_question_mini_mcat','3'),
      ('04580480-1a24-4adc-9d99-1cd7befc155c','salty_bucks','complete_full_mcat','1000'),
      ('df998d42-9b19-4487-b8c1-75cd12a12fbd','salty_bucks','active_on_site_2min','10'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c482c','salty_bucks','flashcard_reset_p_level','3'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c482d','completion_meter','oil_activity_days_amount','5'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c482e','completion_meter','oil_activity_amount_threshold','3'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c482f','completion_meter','mileage_max_value','10000'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c483a','completion_meter','velocity_days_amount','3'),
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c483b','completion_meter','velocity_multiplier','1'),
      ('26951d8c-2bae-437c-b4ce-362f687c7c81','salty_bucks','velocity_streak','100');
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('26951d8c-2bae-437c-b4ce-362f687c7c80','salty_bucks','dashboard_velocity_3_days_green','123'),
      ('26951d8c-2bae-437c-b4ce-362f687c7c82','salty_bucks','register_as_patrician','500'),
      ('26951d8c-2bae-437c-b4ce-362f687c7c83','salty_bucks','register_as_plebeian','500'),
      ('26951d8c-2bae-437c-b4ce-362f687c7c84','salty_bucks','register_as_libertus','100'),
      ('608bbcab-b6cf-4588-8749-38b9ec4307be','salty_bucks','watch_new_video','5'),
      ('45ea77a6-4088-4a45-aa4e-ce93dfdd96ce','salty_bucks','sign_up_free_trial','25'),
      ('4d413610-ab7d-4e20-880d-4d9cbae8717f','salty_bucks','purchase_course','500'),
      ('4d413610-ab7d-4e20-880d-4d9cbae8717e','2_factor_authentication','enable_2fa','0'),
      ('240abd12-49f3-4f89-bff6-278505f7971c','courses','auto-pause-delay','600'),
      ('44d2e180-efe3-496d-ae7f-eff5a9840027','support_tab','status_page_link','http://examkrackers.com/4');
    INSERT INTO public.app_settings (id,"namespace","name",value) VALUES
      ('cf07e963-f4fc-4f11-82c8-53bb9b3c4820','salty_bucks','rating_video','10');
  `)
)
