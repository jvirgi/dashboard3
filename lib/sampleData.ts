import { DataModel, CategoryDim, BrandDim, ProductDim, RetailerDim, DateDim, ThemeDim, ReviewFact } from './types'

function makeSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1103515245 * state + 12345) >>> 0
    return state / 0xffffffff
  }
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

const seed = 20240801
const rand = makeSeededRandom(seed)

// Dimensions
const categories: CategoryDim[] = [
  { categoryId: 'cat_beauty', name: 'Beauty Care' },
  { categoryId: 'cat_groom', name: 'Grooming' },
  { categoryId: 'cat_oral', name: 'Oral Care' },
  { categoryId: 'cat_house', name: 'Household' }
]

const brands: BrandDim[] = []
const products: ProductDim[] = []

const brandNames: Record<string, string[]> = {
  cat_beauty: ['Aurelia', 'Velura', 'Bloomé', 'Chroma', 'Lustre'],
  cat_groom: ['EdgeCraft', 'Stately', 'TrimX', 'UrbanMan'],
  cat_oral: ['WhitenUp', 'FreshMint', 'EnamelPro', 'BrightSmile'],
  cat_house: ['PureHome', 'Sparkle', 'CitrusWave', 'EcoClean']
}

const priceTiers: ProductDim['priceTier'][] = ['Value', 'Mass', 'Premium']

for (const c of categories) {
  for (const name of brandNames[c.categoryId]) {
    const brandId = `b_${name.toLowerCase().replace(/[^a-z]/g,'')}`
    brands.push({ brandId, categoryId: c.categoryId, name })
    const numProducts = 6 + Math.floor(rand() * 4) // 6-9 products per brand
    for (let i = 0; i < numProducts; i++) {
      const productId = `${brandId}_p${i+1}`
      const priceTier = priceTiers[Math.floor(rand()*priceTiers.length)]
      const nameSuffix = ['Serum','Cream','Gel','Foam','Brush','Kit','Pads','Strips','Cleanser'][i % 9]
      products.push({ productId, brandId, name: `${name} ${nameSuffix} ${i+1}`, priceTier })
    }
  }
}

const retailers: RetailerDim[] = [
  { retailerId: 'ret_amazon', name: 'Amazon' },
  { retailerId: 'ret_walmart', name: 'Walmart' },
  { retailerId: 'ret_target', name: 'Target' },
  { retailerId: 'ret_ulta', name: 'Ulta Beauty' },
  { retailerId: 'ret_cvs', name: 'CVS Pharmacy' },
  { retailerId: 'ret_walgreens', name: 'Walgreens' }
]

function monthsBack(n: number): Date[] {
  const out: Date[] = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(start.getFullYear(), start.getMonth() - i, 1))
  }
  return out
}

const dateObjs = monthsBack(18)
const dates: DateDim[] = dateObjs.map((d) => {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const dateKey = `${y}-${String(m).padStart(2, '0')}`
  return { dateKey, date: d, month: m, year: y, monthName: d.toLocaleString(undefined, { month: 'short' }) }
})

const themes: ThemeDim[] = [
  { themeId: 'th_scent', name: 'Scent' },
  { themeId: 'th_texture', name: 'Texture' },
  { themeId: 'th_longevity', name: 'Longevity' },
  { themeId: 'th_value', name: 'Value for Money' },
  { themeId: 'th_packaging', name: 'Packaging' },
  { themeId: 'th_sensitivity', name: 'Sensitivity' },
  { themeId: 'th_whitening', name: 'Whitening' },
  { themeId: 'th_moisture', name: 'Moisturizing' },
  { themeId: 'th_irritation', name: 'Irritation' },
  { themeId: 'th_ease', name: 'Ease of Use' }
]

// Baselines per category/price
const categoryRatingBaseline: Record<string, number> = {
  cat_beauty: 4.2,
  cat_groom: 4.0,
  cat_oral: 4.1,
  cat_house: 4.0
}

const priceTierAdjust: Record<ProductDim['priceTier'], number> = {
  Value: -0.2,
  Mass: 0,
  Premium: 0.2
}

const retailerVolumeBias: Record<string, number> = {
  ret_amazon: 0.5,
  ret_walmart: 0.2,
  ret_target: 0.15,
  ret_ulta: 0.07,
  ret_cvs: 0.05,
  ret_walgreens: 0.03
}

const quotePhrases = {
  positive: [
    'Exceeded my expectations', 'Absolutely love it', 'Great value', 'Works like a charm', 'Smells amazing',
    'Gentle and effective', 'Noticeable results', 'Will repurchase', 'Highly recommend', 'Fantastic quality'
  ],
  neutral: [
    'Does the job', 'Decent for the price', 'Okay overall', 'Average performance', 'Nothing special'
  ],
  negative: [
    'Not worth it', 'Irritated my skin', 'Did not whiten as promised', 'Leaked in packaging', 'Too harsh',
    'Unpleasant scent', 'Stopped working after a week', 'Poor value', 'Messy to use'
  ]
}

function buildReviewText(rand: () => number, themesChosen: ThemeDim[], rating: number): string {
  const pool = rating >= 4 ? quotePhrases.positive : rating <= 2 ? quotePhrases.negative : quotePhrases.neutral
  const prefix = pick(rand, pool)
  const themePart = themesChosen.length ? ` - ${themesChosen[0].name.toLowerCase()} was a key factor.` : ''
  return `${prefix}.${themePart}`
}

// Generate a target number of reviews by random sampling
const TARGET_REVIEWS = 6000

const reviews: ReviewFact[] = []

const productById = new Map(products.map(p=>[p.productId, p]))
const brandById = new Map(brands.map(b=>[b.brandId, b]))

for (let i = 0; i < TARGET_REVIEWS; i++) {
  const product = pick(rand, products)
  const brand = brandById.get(product.brandId)!
  const category = brand.categoryId
  const retailer = pick(rand, retailers)
  const date = pick(rand, dates)

  // Skew selections by retailer volume bias
  if (rand() > (retailerVolumeBias[retailer.retailerId] || 0.1) + 0.15) { continue }

  const base = categoryRatingBaseline[category] + priceTierAdjust[product.priceTier]
  const noise = (rand() - 0.5) * 1.0
  const ratingFloat = clamp(base + noise, 1, 5)
  const rating = Math.round(ratingFloat)

  const sentiment = clamp((ratingFloat - 1) / 4 + (rand()-0.5)*0.05, 0, 1)

  const themesChosen = Array.from({ length: 1 + Math.floor(rand()*2) }, () => pick(rand, themes))
  // Deduplicate chosen themes
  const themeIds = Array.from(new Set(themesChosen.map(t=>t.themeId)))

  const text = buildReviewText(rand, themes.filter(t=>themeIds.includes(t.themeId)), rating)

  // construct random day within the month
  const day = 1 + Math.floor(rand()*28)
  const d = new Date(date.year, date.month - 1, day)
  const dateKeyDay = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  reviews.push({
    reviewId: `r_${i}`,
    productId: product.productId,
    retailerId: retailer.retailerId,
    dateKey: date.dateKey,
    rating,
    sentimentScore: Number(sentiment.toFixed(3)),
    themeIds,
    text,
    helpfulVotes: Math.floor(rand()*20),
    dateKeyDay,
    reviewDate: d,
  })
}

export const sampleData: DataModel = {
  categories,
  brands,
  products,
  retailers,
  dates,
  themes,
  reviews
}