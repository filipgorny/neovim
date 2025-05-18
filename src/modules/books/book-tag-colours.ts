export enum BookTagColourEnum {
  purple = 'purple',
  red = 'red',
  blue = 'blue',
  green = 'green',
  orange = 'orange',
  brown = 'brown',
  mathPurple = 'mathPurple',
  aquamarine = 'aquamarine',
  turquoise = 'turquoise',
  yellow = 'yellow',
  terraCotta = 'terraCotta',
  gold = 'gold',
  tangerine = 'tangerine',
  guacamole = 'guacamole',
  ultramarine = 'ultramarine',
  grape = 'grape',
  moss = 'moss',
  slate = 'slate',
}

export type BookTagColourType = keyof typeof BookTagColourEnum

export const BookTagColourTypes = Object.values(BookTagColourEnum)
