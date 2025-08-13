import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main(){
  const tmpOut = resolve(__dirname, '../.tmp/sampleData.bundle.mjs')
  await build({
    entryPoints: [resolve(__dirname, '../lib/sampleData.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: tmpOut,
    sourcemap: false,
    logLevel: 'silent',
  })
  const mod = await import(pathToFileURL(tmpOut).toString())
  const sampleData = mod.sampleData
  const outDir = resolve(__dirname, '../public')
  await mkdir(outDir, { recursive: true })
  await writeFile(resolve(outDir, 'data.json'), JSON.stringify(sampleData))
  console.log('Wrote public/data.json')
}

main().catch(e=>{ console.error(e); process.exit(1) })