const { execSync } = require('child_process')
const https = require('https')
const fs = require('fs')
const path = require('path')

const OUTPUT = '/tmp/models'

// All models that need images, with search hints (product slugs or search terms)
const TARGETS = {
  victor: {
    dir: 'victor',
    site: 'shop.au.victorsport.com',
    slugMap: {
      'auraspeed-90k-metallic': 'ars-90k-metallic-r',
      'auraspeed-100x-ultra': 'auraspeed-100x-ultra',
      'thruster-fc-ultra-x': 'thruster-f-c-ultra-x',
      'thruster-ryuga-ii-pro': 'thruster-ryuga-ii-pro',
      'drivex-10-metallic': 'drivex-10-metallic',
      'jetspeed-s12-ii': 'jetspeed-s-12-ii',
      'p9200-iii': 'p9200-iii',
      'p9200-tty': 'p9200-tty',
      'a970-ace': 'a970-ace',
      's82-iii': 's82-iii',
      'champion-no1': 'champion-no-1',
      'master-ace': 'master-ace',
      'bag-supreme-9r': 'supreme-multithermobag-9r',
    }
  },
  lining: {
    dir: 'lining',
    site: 'in.lining.studio',
    slugMap: {
      'axforce-90-tiger': 'axforce-90-tiger-max-4u',
      'axforce-90-dragon': 'axforce-90-dragon-max-3u',
      'bladex-900-sun': 'bladex-900-sun-max-set-4u',
      'bladex-900-moon': 'bladex-900-moon-max-set-4u',
      'halbertec-9000': 'halbertec-9000',
      'axforce-100-ii': 'axforce-100-ii',
      'saga-pro': 'saga-pro',
      'ranger-td': 'ranger-td',
      'a-plus-900': 'a-plus-900',
    }
  },
  mizuno: {
    dir: 'mizuno',
    searchQueries: [
      'Wave Fang Pro badminton shoe',
      'Wave Fang Zero 2 badminton shoe',
      'Wave Claw Neo 3 badminton shoe',
    ],
    slugs: ['wave-fang-pro', 'wave-fang-zero-2', 'wave-claw-neo-3']
  },
  asics: {
    dir: 'asics',
    slugs: ['gel-blade-8', 'gel-rocket-11', 'court-control-ff-3'],
  },
  babolat: {
    dir: 'babolat',
    slugs: ['x-feel-blast', 'satelite-blast'],
  },
  carlton: {
    dir: 'carlton',
    slugs: ['kinesis-ultra', 'vapour-trail-pure'],
  },
  forza: {
    dir: 'forza',
    slugs: ['precision-12000-vs', 'power-999'],
  },
  kawasaki: {
    dir: 'kawasaki',
    slugs: ['honor-s6', 'king-k9'],
  },
  kason: {
    dir: 'kason',
    slugs: ['feather-k600'],
  },
  apacs: {
    dir: 'apacs',
    slugs: ['fantala-60-speed', 'z-ziggler'],
  },
  fleet: {
    dir: 'fleet',
    slugs: ['woven-1000-iii', 'tj-power'],
  },
  bonny: {
    dir: 'bonny',
    slugs: ['8888ax', 'phantom-90', 'black-tortoise', 'steel-wings-j20', 'ft68pp'],
  },
  rsl: {
    dir: 'rsl',
    slugs: ['at70', 'at70-ultra', 'extreme-cheetah', 'tourney-no7', 'tourney-no5', 'tourney-no4'],
  },
  dhs: {
    dir: 'dhs',
    slugs: ['m-racket', '301'],
  },
  kumpoo: {
    dir: 'kumpoo',
    slugs: ['devil', 'shura-ii', 'chengfeng-8u', 'jinsong', 'shi-ri-ii', 'kuangshen', 'guolun-2300'],
  },
  gosen: {
    dir: 'gosen',
    slugs: ['inferno-smart', 'inferno', 'roots-5000r', 'roots-xuan', 'gungnir', 'lotus', 'ryzonic-45'],
  }
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

async function downloadFromShopifyJSON(outputDir, fileName, site, productSlug) {
  const url = `https://${site}/products/${productSlug}.json`
  const outPath = path.join(outputDir, fileName)
  try {
    const jsonStr = await fetchJSON(url)
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

async function downloadFromURL(outputDir, fileName, urls) {
  const outPath = path.join(outputDir, fileName)
  for (const url of urls) {
    try {
      execSync(`curl -sL -o "${outPath}" "${url}"`, { timeout: 15000 })
      const stats = fs.statSync(outPath)
      if (stats.size > 5000) return true
    } catch (e) {}
  }
  return false
}

async function main() {
  let success = 0, fail = 0

  // 1) Victor - Shopify JSON
  const victorDir = path.join(OUTPUT, 'victor')
  fs.mkdirSync(victorDir, { recursive: true })
  for (const [fileName, slug] of Object.entries(TARGETS.victor.slugMap)) {
    const ok = await downloadFromShopifyJSON(victorDir, `${fileName}.jpg`, TARGETS.victor.site, slug)
    if (ok) { success++; console.log(`  ✓ victor/${fileName}.jpg`) }
    else { fail++; console.log(`  ✗ victor/${fileName}.jpg`) }
  }

  // 2) Li-Ning - Shopify JSON
  const liningDir = path.join(OUTPUT, 'lining')
  fs.mkdirSync(liningDir, { recursive: true })
  for (const [fileName, slug] of Object.entries(TARGETS.lining.slugMap)) {
    const ok = await downloadFromShopifyJSON(liningDir, `${fileName}.jpg`, TARGETS.lining.site, slug)
    if (ok) { success++; console.log(`  ✓ lining/${fileName}.jpg`) }
    else { fail++; console.log(`  ✗ lining/${fileName}.jpg`) }
  }

  console.log(`\nDone: ${success} ok, ${fail} failed`)
  console.log(`Yonex: 16 images already in /tmp/models/yonex/`)
}

main().catch(console.error)
