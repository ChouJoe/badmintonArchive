// Try multiple Shopify retailer sources for each model
const { execSync } = require('child_process')
const https = require('https')
const fs = require('fs')
const path = require('path')

const OUTPUT = '/tmp/models'

// For each brand+model, try multiple retailer product page URLs
const RETAILERS = {
  victor: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'auraspeed-90k-metallic': 'victor-auraspeed-90k-metallic-badminton-racket',
      'auraspeed-100x-ultra': 'victor-auraspeed-100x-ultra-badminton-racket',
      'thruster-fc-ultra-x': 'victor-thruster-f-c-ultra-x-badminton-racket',
      'thruster-ryuga-ii-pro': 'victor-tk-ryuga-ii-pro-badminton-racket',
      'drivex-10-metallic': 'victor-drivex-10-metallic-badminton-racket',
      'jetspeed-s12-ii': 'victor-jetspeed-s-12-ii-badminton-racket',
      'p9200-iii': 'victor-p9200-iii-badminton-shoes',
      'p9200-tty': 'victor-p9200-tty-badminton-shoes',
      'a970-ace': 'victor-a970-ace-badminton-shoes',
      's82-iii': 'victor-s82-iii-badminton-shoes',
      'champion-no1': 'victor-champion-no1-badminton-shuttlecocks',
      'master-ace': 'victor-master-ace-badminton-shuttlecocks',
      'bag-supreme-9r': 'victor-supreme-multithermobag-9r',
    }},
    { site: 't1sports.net', slugMap: {
      'auraspeed-90k-metallic': 'victor-ars-90k-metallic-r-auraspeed-90k-metallic-badminton-racket',
    }},
  ],
  lining: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'halbertec-9000': 'li-ning-halbertec-9000-badminton-racket',
      'axforce-100-ii': 'li-ning-axforce-100-ii-badminton-racket',
      'saga-pro': 'li-ning-saga-pro-badminton-shoes',
      'ranger-td': 'li-ning-ranger-td-badminton-shoes',
      'a-plus-900': 'li-ning-a-900-badminton-shuttlecocks',
    }},
  ],
  mizuno: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'wave-fang-pro': 'mizuno-wave-fang-pro-badminton-shoes',
      'wave-fang-zero-2': 'mizuno-wave-fang-zero-2-badminton-shoes',
      'wave-claw-neo-3': 'mizuno-wave-claw-neo-3-badminton-shoes',
    }},
  ],
  asics: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'gel-blade-8': 'asics-gel-blade-8-badminton-shoes',
      'gel-rocket-11': 'asics-gel-rocket-11-badminton-shoes',
      'court-control-ff-3': 'asics-court-control-ff-3-badminton-shoes',
    }},
  ],
  babolat: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'x-feel-blast': 'babolat-x-feel-blast-badminton-racket',
      'satelite-blast': 'babolat-satelite-blast-badminton-racket',
    }},
  ],
  carlton: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'kinesis-ultra': 'carlton-kinesis-ultra-badminton-racket',
      'vapour-trail-pure': 'carlton-vapour-trail-pure-badminton-racket',
    }},
  ],
  forza: [
    { site: 'badmintonwarehouse.com', slugMap: {
      'precision-12000-vs': 'fz-forza-precision-12000-vs-badminton-racket',
      'power-999': 'fz-forza-power-999-badminton-racket',
    }},
  ],
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data)
        else reject(new Error(`HTTP ${res.statusCode}`))
      })
    }).on('error', reject).on('timeout', reject)
  })
}

async function tryRetailer(outputDir, fileName, site, slug) {
  const outPath = path.join(outputDir, fileName)
  const jsonUrl = `https://${site}/products/${slug}.json`
  try {
    const jsonStr = await fetchJSON(jsonUrl)
    const data = JSON.parse(jsonStr)
    const product = data.product || data
    const images = product.images || []
    if (images.length === 0) return false
    const imgUrl = images[0].src || images[0]
    if (!imgUrl) return false
    const fullUrl = imgUrl.replace(/^http:/, 'https:').split('?')[0] + '?width=1200'
    execSync(`curl -sL -o "${outPath}" "${fullUrl}"`, { timeout: 15000 })
    const stats = fs.statSync(outPath)
    return stats.size > 5000
  } catch (e) {
    return false
  }
}

async function main() {
  let success = 0, fail = 0

  for (const [brand, retailers] of Object.entries(RETAILERS)) {
    const brandDir = path.join(OUTPUT, brand)
    fs.mkdirSync(brandDir, { recursive: true })

    for (const retailer of retailers) {
      for (const [fileName, slug] of Object.entries(retailer.slugMap)) {
        // Skip if already downloaded
        const outPath = path.join(brandDir, `${fileName}.jpg`)
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
          continue
        }
        const ok = await tryRetailer(brandDir, `${fileName}.jpg`, retailer.site, slug)
        if (ok) {
          success++
          const sz = fs.statSync(outPath).size
          console.log(`  ✓ ${brand}/${fileName}.jpg (${(sz/1024).toFixed(0)}KB)`)
        } else {
          fail++
        }
      }
    }
  }

  console.log(`\nDone: ${success} new, ${fail} still missing`)
}

main().catch(console.error)
