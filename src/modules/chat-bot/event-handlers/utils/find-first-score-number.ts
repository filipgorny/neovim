export const findFirstScoreNumber = (jsonArray: any[]): number | null => {
  if (!Array.isArray(jsonArray)) return null

  const scoreItem = jsonArray.find(item => item?.score_number !== undefined)

  return scoreItem ? scoreItem.score_number : null
}
