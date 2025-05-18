import * as R from 'ramda'
import { createAminoAcidGameEntry } from '../amino-acid-games-service'
import { AminoAcidGameDTO } from '../../../types/amino-acid-game'
import { AcidNamesDifficultyEnum } from '../acid-names-difficulty'
import { create } from '../amino-acid-games-repository'
import { earnSaltyBucksForEndingAminoAcidGame } from '../../../../services/salty-bucks/salty-buck-service'

jest.mock('../amino-acid-games-repository', () => ({
  __esModule: true,
  create: jest.fn(() => ({ id: '333' })),
}))
jest.mock('../../../../services/salty-bucks/salty-buck-service')

describe('testing amino acid game service', () => {
  const student_id = '777'
  const amino_acid_game_dto: AminoAcidGameDTO = {
    score: 123,
    correct_amount: 10,
    incorrect_amount: 5,
    blox_game_enabled: true,
    acid_names_difficulty: AcidNamesDifficultyEnum.short,
    answers: [{
      acid_id: 'fenosine',
      answer: 'blabline',
      group: 'foo bar',
      is_correct: true,
    }],
    ia_a_win: true,
    expenses: 23,
    is_paused: false,
  }

  it('checks if createAminoAcidGameEntry calls the necessary functions', async () => {
    await createAminoAcidGameEntry(student_id, amino_acid_game_dto)
    expect(create).toHaveBeenCalled()
    expect((create as jest.Mock).mock.calls.length).toBe(1)
    const amino_acid_game_dto_copy = R.omit(['expenses'])({
      student_id,
      ...amino_acid_game_dto,
      answers: JSON.stringify(amino_acid_game_dto.answers),
    })
    expect((create as jest.Mock).mock.calls[0][0]).toEqual(amino_acid_game_dto_copy)
    expect(earnSaltyBucksForEndingAminoAcidGame).toHaveBeenCalled()
    expect((earnSaltyBucksForEndingAminoAcidGame as jest.Mock).mock.calls.length).toBe(1)
    // expect((earnSaltyBucksForEndingAminoAcidGame as jest.Mock).mock.calls[0]).toEqual([student_id, '333', 100])
  })
})
