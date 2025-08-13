import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main(){
  const tmpDir = resolve(__dirname, '../.tmp')
  const outData = resolve(tmpDir, 'sampleData.bundle.mjs')
  const outAgg = resolve(tmpDir, 'aggregate.bundle.mjs')

  await build({ entryPoints: [resolve(__dirname, '../lib/sampleData.ts')], bundle: true, platform: 'node', format: 'esm', outfile: outData, logLevel: 'silent' })
  await build({ entryPoints: [resolve(__dirname, '../lib/aggregate.ts')], bundle: true, platform: 'node', format: 'esm', outfile: outAgg, logLevel: 'silent' })

  const dataMod = await import(pathToFileURL(outData).toString())
  const aggMod = await import(pathToFileURL(outAgg).toString())

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

  const agg = aggMod.aggregateOverview(dataMod.sampleData, filters)
  const outDir = resolve(__dirname, '../public/aggregates')
  await mkdir(outDir, { recursive: true })
  await writeFile(resolve(outDir, 'default.json'), JSON.stringify(agg))
  console.log('Wrote public/aggregates/default.json')
}

main().catch((e)=>{ console.error(e); process.exit(1) })