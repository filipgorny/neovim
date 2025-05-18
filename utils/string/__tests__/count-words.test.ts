import { countWords } from '../count-words'

describe('count-words', () => {
  it('counts words in plain text', () => {
    const input = 'foo bar baz'
    const expected = 3

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('counts words in plain text with additional spaces', () => {
    const input = ' foo  bar baz '
    const expected = 3

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('counts words in HTML with additional spaces', () => {
    const input = ' <div id="abc">foo bar</div> and  <strong>some <i nested="attr" second-attr=42>more</i></strong> '
    const expected = 5

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('handles numbers properly', () => {
    const input = 42
    const expected = 1

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('counts words in HTML with additional spaces and several lines', () => {
    const input = `
      This is a <strong id="foo">multiline</strong>.
      
      Paragraph content
    `
    const expected = 6

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('counts words in HTML with additional spaces and several lines (different format)', () => {
    const input = 'This is a <strong id="foo">multiline</strong>.\n' +
      '\n' +
      'Paragraph content'

    const expected = 6

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('counts words in a real life example', () => {
    const input = '<span style="font-size:11.0pt;"><b>Passage 2<br/><br/></b></span><span style="font-size:11.0pt;">The lack of creative capacity in the American labor force, much bemoaned by economists in recent years, is the result of an education system that does not recognize or appreciate the value of open-ended, interest-driven learning. The skills demanded by the innovation economy are technological literacy, creativity, innovation, problem-solving, and collaboration, but with the exception of a few ‘experimental’ schools open to especially precocious youth or forward-thinking parents, little in our current classroom paradigm has changed since the 1940s. Most school environments are designed for a teacher to stand in front of a class of thirty students set in neat rows, listening, taking notes, and doing worksheets. Written curricular standards often stress creativity, innovation, and critical thinking, but teachers rarely bring these standards to life as learning outcomes or objectives. The reality on the ground is that, in our factory-model system of education, standardized testing drives the curriculum while creative activity is relegated to the sidelines. This despite the fact that creativity is the number one competency sought by American CEOs.<br/><br/>Our curricula must reflect the principle that learning is the transformation brought about by experience, not the memorization of predigested content. When students actively gather and interpret information in the context of guided inquiry or experimentation, they simultaneously acquire content knowledge and gain transferable skills and concepts. While the rote acquisition of some information—for instance, important dates and multiplication tables—is probably unavoidable, the development of the creative muscle requires personally-involved, self-initiated educational experiences. The role of the teacher, on this model, is to facilitate learning by creating a positive climate, having an accurate understanding of the learner’s needs, and making appropriate resources available.<br/><br/>And crucially, educators must stop holding the real world at arm’s length. Unlike our increasingly complex and globalized world, where problems are multifaceted and may require collaborative, synergistic solutions, the classroom presents “problems” that are easily solvable and spoon-feeds students the answers from the back of the book or the instructor. Knowledge transfer between subjects is avoided in favor of domain specificity, which limits convergent and creative dialogue. This is remediable by ensuring that education is grounded in the real world, so that students are given the opportunity to tolerate and engage with complexity.<br/><br/>Finally, students must be allowed to learn persistence. Even putting standardized testing to one side, most of the assessment tools still in favor in our schools encourage students to amass facts and trivia, remember them for a very short time, and then forget them as soon as the results of the assessment are revealed. Students who do this successfully are rewarded, while students who do not are told that they have failed. These students are seldom given an opportunity to reengage with the material; failure is final. The development of creative problem-solving skills, however, requires deep rather than superficial engagement with learning materials, the opportunity to self-reflect, and the time to recognize and develop one’s abilities and creative talents. Persistence through failure and reiteration is a skill known to be common in innovators, and it should be rewarded in our schools.<br/><br/>In a highly developed country where technology and ingenuity are of paramount importance to continued prosperity, and in an age of increasing flexibility in the global labor market, American schools must not be allowed to continue to prepare an entire nation of students for the handful of remaining assembly-line jobs.<br/><br/>This passage was adapted from “Associating Creativity, Context, and Experiential Learning.” Hondzel, Catharine. </span><span style="font-size:11.0pt;"><i>Education Inquiry</i></span><span style="font-size:11.0pt;">. 2015. 6(2); doi: 10.3402/edui.v6.23403 for use under the Creative Commons CC BY 4.0 license (http://creativecommons.org/licenses/by/4.0/legalcode). <br/><br/></span>'

    const expected = 591

    const result = countWords(input)

    expect(result).toEqual(expected)
  })

  it('returns 0 for empty / undefined / null string', () => {
    const inputEmpty = ''
    const inputUndefined = undefined
    const inputNull = null

    const expected = 0

    const resultEmpty = countWords(inputEmpty)
    const resultUndefined = countWords(inputUndefined)
    const resultNull = countWords(inputNull)

    expect(resultEmpty).toEqual(expected)
    expect(resultUndefined).toEqual(expected)
    expect(resultNull).toEqual(expected)
  })
})
