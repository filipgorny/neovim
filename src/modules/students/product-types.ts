export enum ProductTypeEnum {
  exam = 'E',
  book = 'T',
}

export type ProductType = keyof typeof ProductTypeEnum

export const ProductTypes = Object.values(ProductTypeEnum)
