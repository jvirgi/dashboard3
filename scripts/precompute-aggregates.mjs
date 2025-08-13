import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main(){
  const { sampleData } = await import('../lib/sampleData.js')
  const { aggregateOverview } = await import('../lib/aggregate.js')
  const filters = {
    selectedCategoryIds: [],
    selectedBrandIds: [],
    selectedRetailerIds: [],
    selectedRegions: [],
    selectedThemes: [],
    ratingRange: [1,5],
    productQuery: '',
    selectedAttributes: [],
    timeframe: { mode: 'preset', months: 12 },
    granularity: 'month',
  }
  const agg = aggregateOverview(sampleData, filters)
  const outDir = resolve(__dirname, '../public/aggregates')
  await mkdir(outDir, { recursive: true })
  await writeFile(resolve(outDir, 'default.json'), JSON.stringify(agg))
  console.log('Wrote default aggregates to public/aggregates/default.json')
}

main().catch((e)=>{ console.error(e); process.exit(1) })