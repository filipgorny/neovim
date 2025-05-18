const randomDigit = () => Math.floor(Math.random() * 10)

export const randomPin = (length = 4) => {
  const digits = []

  for (let i = 0; i < length; i++) {
    digits.push(randomDigit())
  }

  return digits.join('')
}
