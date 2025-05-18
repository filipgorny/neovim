export const convertUsaDate = (date: string) => {
  if (!date) {
    return null
  }

  const result = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}).*/)

  if (result) {
    const [_, month, day, year] = result

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return date
}
