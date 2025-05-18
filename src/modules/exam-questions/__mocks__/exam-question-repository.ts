export const questionExample = ({
  id: '7d66bea0-bf13-4c32-82d8-c0a55d39a170',
  passage_id: 'fee0bfbc-30f0-40fd-a3fa-d3eb8254e58f',
  question_content: 'Echocardiography is a technique that utilizes ultrasound in the 2-3 MHz range to generate images and measurements of the heart. The upper limit of human hearing is approximately 20 kHz. Why are such high frequencies used?',
  answer_definition: '{"A":"Short wavelengths are necessary to obtain higher resolution of small structures.","B":"Long wavelengths are necessary to obtain higher resolution of small structures.","C":"Short wavelengths are less likely to be absorbed by tissue and can image deeper parts of the body.","D":"Long wavelengths are less likely to be absorbed by tissue and can image deeper parts of the body."}',
  explanation: 'A<br/>The question stem conveys that high frequencies are needed for this ultrasound technique to work. High frequency corresponds to short wavelength, since frequency and wavelength are inversely proportional, as seen in the equation f = v/λ. Shorter wavelengths are useful in imaging finer structures, as the resolution for imaging techniques is typically proportional to wavelength, whether it be for light or sound. Choice C is false, as shorter wavelengths are more likely to be absorbed by tissue, as cells and their components are of similar size. Choice D is true, and is the reason that higher frequencies than 3 MHz are not used. The question stem asks why high frequency sounds are used, though, so choice D does not answer the question.',
  chapter: 'Physics | Waves: Sound and Light',
  question_type: 'single_choice',
  correct_answer: 'A',
  order: 1,
  correct_answers_amount: 2,
  all_answers_amount: 4,
  difficulty_percentage: 50,
  answer_distribution: {
    A: {
      amount: 2,
      percentage: 100,
    },
    B: {
      amount: 1,
      percentage: 25,
    },
    C: {
      amount: 1,
      percentage: 33,
    },
    D: {
      amount: 0,
      percentage: 0,
    },
  },
})

export const findOneOrFail = () => questionExample

export const patch = (id, payload) => payload
