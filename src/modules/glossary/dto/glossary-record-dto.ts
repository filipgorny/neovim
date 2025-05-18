export type GlossaryRecordDTO = {
  phrase_raw: string,
  explanation_raw: string,
  phrase_delta_object: string,
  explanation_delta_object: string,
  phrase_html: string,
  explanation_html: string,
}

export const makeDTO = (
  phrase_raw: string,
  explanation_raw: string,
  phrase_delta_object: string,
  explanation_delta_object: string,
  phrase_html: string,
  explanation_html: string
): GlossaryRecordDTO => ({
  phrase_raw,
  explanation_raw,
  phrase_delta_object,
  explanation_delta_object,
  phrase_html,
  explanation_html,
})

export default GlossaryRecordDTO
