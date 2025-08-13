import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main(){
  const { sampleData } = await import('../lib/sampleData.js')
  const outDir = resolve(__dirname, '../public')
  await mkdir(outDir, { recursive: true })
  await writeFile(resolve(outDir, 'data.json'), JSON.stringify(sampleData))
  console.log('Wrote public/data.json')
}

main().catch(e=>{ console.error(e); process.exit(1) })