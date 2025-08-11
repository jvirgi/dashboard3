export type CategoryDim = {
  categoryId: string
  name: string
}

export type BrandDim = {
  brandId: string
  categoryId: string
  name: string
}

export type ProductDim = {
  productId: string
  brandId: string
  name: string
  priceTier: 'Value' | 'Mass' | 'Premium'
  attributes: string[]
}

export type RetailerDim = {
  retailerId: string
  name: string
}

export type DateDim = {
  dateKey: string // YYYY-MM
  date: Date
  month: number
  year: number
  monthName: string
}

export type ThemeDim = {
  themeId: string
  name: string
  group?: string
}

export type ReviewFact = {
  reviewId: string
  productId: string
  retailerId: string
  dateKey: string // YYYY-MM
  rating: number // 1..5
  sentimentScore: number // 0..1
  themeIds: string[]
  text: string
  helpfulVotes: number
  // new fields for day-level analysis
  dateKeyDay: string // YYYY-MM-DD
  reviewDate: Date
  // geography
  region: 'NA' | 'EU' | 'APAC' | 'LATAM'
  country: string
}

export type DataModel = {
  categories: CategoryDim[]
  brands: BrandDim[]
  products: ProductDim[]
  retailers: RetailerDim[]
  dates: DateDim[]
  themes: ThemeDim[]
  reviews: ReviewFact[]
}