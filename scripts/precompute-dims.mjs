import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function makeSeededRandom(seed){ let s = seed>>>0; return ()=> (s = (1103515245*s + 12345)>>>0, s/0xffffffff) }
function monthsBack(n){ const out=[]; const now=new Date(); const start=new Date(now.getFullYear(), now.getMonth(), 1); for(let i=n-1;i>=0;i--){ out.push(new Date(start.getFullYear(), start.getMonth()-i,1)) } return out }

async function main(){
  const rand = makeSeededRandom(20240801)
  const categories = [
    { categoryId: 'cat_beauty', name: 'Beauty Care' },
    { categoryId: 'cat_groom', name: 'Grooming' },
    { categoryId: 'cat_oral', name: 'Oral Care' },
    { categoryId: 'cat_house', name: 'Household' }
  ]
  const brandNames = {
    cat_beauty: ['Aurelia', 'Velura', 'Bloomé', 'Chroma', 'Lustre', 'DermaLux', 'SilkSkin'],
    cat_groom: ['EdgeCraft', 'Stately', 'TrimX', 'UrbanMan', 'SteelGroom'],
    cat_oral: ['WhitenUp', 'FreshMint', 'EnamelPro', 'BrightSmile', 'PureDent'],
    cat_house: ['PureHome', 'Sparkle', 'CitrusWave', 'EcoClean', 'ShineBright']
  }
  const priceTiers = ['Value','Mass','Premium']
  const lineNames = ['Radiant Renewal', 'Hydra Boost', 'Ultra Repair', 'Daily Defense', 'Advanced Care', 'Pro Series', 'Gentle Touch']
  const beautyKinds = ['Vitamin C Serum', 'Hyaluronic Acid Moisturizer', 'Retinol Night Cream', 'Foaming Facial Cleanser', 'Brightening Eye Gel']
  const groomKinds = ['Precision Beard Trimmer', '5-Blade Razor Kit', 'Aftershave Balm', 'Beard Oil', 'Shave Gel']
  const oralKinds = ['Whitening Toothpaste', 'Electric Toothbrush', 'Enamel Repair Mouthwash', 'Whitening Strips', 'Interdental Brush Kit']
  const houseKinds = ['Multi-Surface Cleaner', 'Laundry Detergent Pods', 'Dishwasher Tablets', 'Glass & Surface Spray', 'Floor Cleaning Solution']
  const sizes = ['1.0 fl oz', '1.7 fl oz', '6.7 fl oz', '8 oz', '12 oz', '250 mL', '500 mL']
  const packs = ['Single', '2-Pack', '3-Pack', 'Family Size', 'Travel Size']
  const brands=[]; const products=[]
  for (const c of categories){
    for (const name of brandNames[c.categoryId]){
      const brandId = `b_${name.toLowerCase().replace(/[^a-z]/g,'')}`
      brands.push({ brandId, categoryId: c.categoryId, name })
      const numProducts = 10 + Math.floor(rand()*8)
      for (let i=0;i<numProducts;i++){
        const productId = `${brandId}_p${i+1}`
        const attrs = [ rand()>0.5?'Fragrance-Free':'Fragranced', rand()>0.5?'Sensitive Skin':'All Skin Types', rand()>0.5?'Vegan':'Regular' ]
        const kind = c.categoryId==='cat_beauty'? beautyKinds[Math.floor(rand()*beautyKinds.length)] : c.categoryId==='cat_groom'? groomKinds[Math.floor(rand()*groomKinds.length)] : c.categoryId==='cat_oral'? oralKinds[Math.floor(rand()*oralKinds.length)] : houseKinds[Math.floor(rand()*houseKinds.length)]
        const line = lineNames[Math.floor(rand()*lineNames.length)]
        const size = sizes[Math.floor(rand()*sizes.length)]
        const pack = packs[Math.floor(rand()*packs.length)]
        const nameLong = `${name} ${line} ${kind}, ${size}, ${pack} | ${attrs.join(' | ')}`
        const priceTier = priceTiers[Math.floor(rand()*priceTiers.length)]
        products.push({ productId, brandId, name: nameLong, priceTier, attributes: attrs })
      }
    }
  }
  const retailers = [
    { retailerId: 'ret_amazon', name: 'Amazon' },
    { retailerId: 'ret_walmart', name: 'Walmart' },
    { retailerId: 'ret_target', name: 'Target' },
    { retailerId: 'ret_ulta', name: 'Ulta Beauty' },
    { retailerId: 'ret_cvs', name: 'CVS Pharmacy' },
    { retailerId: 'ret_walgreens', name: 'Walgreens' }
  ]
  const dateObjs = monthsBack(18)
  const dates = dateObjs.map(d=>({ dateKey: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, date: d, month: d.getMonth()+1, year: d.getFullYear(), monthName: d.toLocaleString(undefined,{month:'short'}) }))
  const themes = [
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
  const dims = { categories, brands, products, retailers, dates: dates.map(d=>({ ...d, date: undefined })), themes }
  const outDir = resolve(__dirname, '../public')
  await mkdir(outDir, { recursive: true })
  await writeFile(resolve(outDir, 'dims.json'), JSON.stringify(dims))
  console.log('Wrote public/dims.json')

}

main().catch(e=>{ console.error(e); process.exit(1) })