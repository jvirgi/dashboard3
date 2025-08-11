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
  cat_beauty: ['Aurelia', 'Velura', 'Bloomé', 'Chroma', 'Lustre', 'DermaLux', 'SilkSkin'],
  cat_groom: ['EdgeCraft', 'Stately', 'TrimX', 'UrbanMan', 'SteelGroom'],
  cat_oral: ['WhitenUp', 'FreshMint', 'EnamelPro', 'BrightSmile', 'PureDent'],
  cat_house: ['PureHome', 'Sparkle', 'CitrusWave', 'EcoClean', 'ShineBright']
}

const priceTiers: ProductDim['priceTier'][] = ['Value', 'Mass', 'Premium']

// richer product name parts
const lineNames = ['Radiant Renewal', 'Hydra Boost', 'Ultra Repair', 'Daily Defense', 'Advanced Care', 'Pro Series', 'Gentle Touch']
const beautyKinds = ['Vitamin C Serum', 'Hyaluronic Acid Moisturizer', 'Retinol Night Cream', 'Foaming Facial Cleanser', 'Brightening Eye Gel']
const groomKinds = ['Precision Beard Trimmer', '5-Blade Razor Kit', 'Aftershave Balm', 'Beard Oil', 'Shave Gel']
const oralKinds = ['Whitening Toothpaste', 'Electric Toothbrush', 'Enamel Repair Mouthwash', 'Whitening Strips', 'Interdental Brush Kit']
const houseKinds = ['Multi-Surface Cleaner', 'Laundry Detergent Pods', 'Dishwasher Tablets', 'Glass & Surface Spray', 'Floor Cleaning Solution']
const sizes = ['0.5 fl oz', '1.0 fl oz', '1.7 fl oz', '6.7 fl oz', '8 oz', '12 oz', '250 mL', '500 mL', '30 Count', '60 Count', '90 Count']
const packs = ['Single', '2-Pack', '3-Pack', 'Family Size', 'Travel Size']

for (const c of categories) {
  for (const name of brandNames[c.categoryId]) {
    const brandId = `b_${name.toLowerCase().replace(/[^a-z]/g,'')}`
    brands.push({ brandId, categoryId: c.categoryId, name })
    const numProducts = 10 + Math.floor(rand() * 8) // 10-17 products per brand
    for (let i = 0; i < numProducts; i++) {
      const productId = `${brandId}_p${i+1}`
      const priceTier = priceTiers[Math.floor(rand()*priceTiers.length)]
      const attrs = [
        rand()>0.5 ? 'Fragrance-Free' : 'Fragranced',
        rand()>0.5 ? 'Sensitive Skin' : 'All Skin Types',
        rand()>0.5 ? 'Vegan' : 'Regular',
      ]
      // choose kind by category
      const kind = c.categoryId === 'cat_beauty' ? pick(rand, beautyKinds)
        : c.categoryId === 'cat_groom' ? pick(rand, groomKinds)
        : c.categoryId === 'cat_oral' ? pick(rand, oralKinds)
        : pick(rand, houseKinds)
      const line = pick(rand, lineNames)
      const size = pick(rand, sizes)
      const pack = pick(rand, packs)
      // retailer-style long name
      const longName = `${name} ${line} ${kind}, ${size}, ${pack} | ${attrs.join(' | ')}`
      products.push({ productId, brandId, name: longName, priceTier, attributes: attrs })
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

const openingPhrases = {
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

const bodyPhrases = [
  'The texture is pleasant and absorbs quickly',
  'Packaging felt sturdy and premium',
  'I noticed a difference after two weeks of use',
  'The scent lingers but is not overpowering',
  'Instructions were clear and easy to follow',
  'It pairs well with the rest of my routine',
  'Value is great compared to alternatives',
  'It was gentle on my sensitive skin',
  'Battery life is solid and charging is quick',
  'Whitening results were subtle but noticeable'
]

function clampTextToRange(text: string, minLen = 20, maxLen = 500): string {
  if (text.length < minLen) return text.padEnd(minLen, '.')
  if (text.length <= maxLen) return text
  const truncated = text.slice(0, maxLen)
  const lastPeriod = truncated.lastIndexOf('.')
  return (lastPeriod > 40 ? truncated.slice(0, lastPeriod + 1) : truncated) // try to end on a sentence
}

function buildReviewText(rand: () => number, themesChosen: ThemeDim[], rating: number): string {
  const pool = rating >= 4 ? openingPhrases.positive : rating <= 2 ? openingPhrases.negative : openingPhrases.neutral
  const sentences: string[] = []
  sentences.push(pick(rand, pool) + '.')
  if (themesChosen.length) {
    sentences.push(`The ${themesChosen[0].name.toLowerCase()} was a key factor in my experience.`)
  }
  const extra = 1 + Math.floor(rand() * 4) // 1-4 extra sentences
  for (let i = 0; i < extra; i++) sentences.push(pick(rand, bodyPhrases) + '.')
  const base = sentences.join(' ')
  // randomize length target between 20 and 500
  const target = 20 + Math.floor(rand() * 480)
  let out = base
  while (out.length < target) out += ' ' + pick(rand, bodyPhrases) + '.'
  return clampTextToRange(out, 20, 500)
}

// Generate a target number of reviews by random sampling
const TARGET_REVIEWS = 100_000

const reviews: ReviewFact[] = []

const productById = new Map(products.map(p=>[p.productId, p]))
const brandById = new Map(brands.map(b=>[b.brandId, b]))

const regions: Array<{ region: ReviewFact['region']; country: string[] }> = [
  { region: 'NA', country: ['US','CA'] },
  { region: 'EU', country: ['UK','DE','FR','IT','ES'] },
  { region: 'APAC', country: ['JP','KR','AU','SG'] },
  { region: 'LATAM', country: ['BR','MX','AR','CL'] }
]

let attempts = 0
while (reviews.length < TARGET_REVIEWS) {
  attempts++
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


  // construct random day within the month
  const day = 1 + Math.floor(rand()*28)
  const d = new Date(date.year, date.month - 1, day)
  const dateKeyDay = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const geo = pick(rand, regions)
  const country = pick(rand, geo.country)

  reviews.push({
    reviewId: `r_${reviews.length}`,
    productId: product.productId,
    retailerId: retailer.retailerId,
    dateKey: date.dateKey,
    rating,
    sentimentScore: Number(sentiment.toFixed(3)),
    themeIds,
    text: '',
    helpfulVotes: Math.floor(rand()*20),
    dateKeyDay,
    reviewDate: d,
    region: geo.region,
    country,
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