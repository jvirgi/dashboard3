export function sampleReviewText(seedKey: string, rating: number, themeNames: string[]): string {
  // simple deterministic hash to vary text
  let h = 2166136261
  for (let i = 0; i < seedKey.length; i++) { h ^= seedKey.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24) }
  function rnd(){ h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 0xffffffff }

  const openingsPos = ['Exceeded my expectations', 'Absolutely love it', 'Great value', 'Works like a charm', 'Smells amazing']
  const openingsNeu = ['Does the job', 'Decent for the price', 'Okay overall', 'Average performance', 'Nothing special']
  const openingsNeg = ['Not worth it', 'Irritated my skin', 'Did not whiten as promised', 'Leaked in packaging', 'Too harsh']
  const bodies = [
    'The texture is pleasant and absorbs quickly.',
    'Packaging felt sturdy and premium.',
    'I noticed a difference after two weeks of use.',
    'The scent lingers but is not overpowering.',
    'Instructions were clear and easy to follow.',
    'It was gentle on my sensitive skin.',
    'Value is solid compared to alternatives.'
  ]
  const pool = rating >= 4 ? openingsPos : rating <= 2 ? openingsNeg : openingsNeu
  const open = pool[Math.floor(rnd() * pool.length)]
  const theme = themeNames.length ? ` The ${themeNames[0].toLowerCase()} stood out.` : ''
  let text = `${open}.${theme}`
  const target = 20 + Math.floor(rnd() * 180)
  while (text.length < target) { text += ' ' + bodies[Math.floor(rnd() * bodies.length)] }
  return text
}