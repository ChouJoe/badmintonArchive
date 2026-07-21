const { execSync } = require('child_process')
const https = require('https')
const fs = require('fs')
const path = require('path')

const OUTPUT = '/tmp/models'
const SITE = 'triplepointsports.com'

const SLUGS = {
  victor: {
    'auraspeed-90k-metallic': 'victor-auraspeed-90k-metallic-badminton-racket',
    'auraspeed-100x-ultra': 'victor-auraspeed-100x-ultra-badminton-racket',
    'thruster-fc-ultra-x': 'victor-thruster-f-c-ultra-badminton-racket-fortuna-gold',
    'thruster-ryuga-ii-pro': 'victor-thruster-ryuga-ii-pro-badminton-racket',
    'drivex-10-metallic': 'victor-drivex-10-metallic-badminton-racket',
    'jetspeed-s12-ii': 'victor-jetspeed-s-12-ii-badminton-racket',
    'p9200-iii': 'victor-p9200-3-badminton-shoes',
    'p9200-tty': 'victor-p9200-tty-badminton-shoes',
    'a970-ace': 'victor-a970-badminton-shoes',
    's82-iii': 'victor-s82-3-badminton-shoes',
    'champion-no1': 'victor-champion-no-1-badminton-shuttlecocks',
    'master-ace': 'victor-master-ace-badminton-shuttlecocks',
  },
  lining: {
    'halbertec-9000': 'li-ning-halbertec-9000-badminton-racket',
    'axforce-100-ii': 'li-ning-axforce-100-2-badminton-racket',
    'axforce-90-tiger': 'li-ning-axforce-90-max-tiger-badminton-racket',
    'axforce-90-dragon': 'li-ning-axforce-90-max-dragon-badminton-racket',
    'bladex-900-sun': 'li-ning-bladex-900-max-sun-badminton-racket',
    'bladex-900-moon': 'li-ning-bladex-900-max-moon-badminton-racket',
    'saga-pro': 'li-ning-saga-pro-badminton-shoes',
  },
  mizuno: {
    'wave-fang-pro': 'mizuno-wave-fang-pro-badminton-shoes',
    'wave-fang-zero-2': 'mizuno-wave-fang-zero-2-badminton-shoes',
    'wave-claw-neo-3': 'mizuno-wave-claw-neo-3-badminton-shoes',
  },
  asics: {
    'gel-blade-8': 'asics-gel-blade-8-badminton-shoes',
    'gel-rocket-11': 'asics-gel-rocket-11-badminton-shoes',
    'court-control-ff-3': 'asics-court-control-ff-3-badminton-shoes',
  },
  babolat: {
    'x-feel-blast': 'babolat-x-feel-blast-badminton-racket',
    'satelite-blast': 'babolat-satelite-blast-badminton-racket',
  },
  kawasaki: {
    'honor-s6': 'kawasaki-honor-s6-badminton-racket',
    'king-k9': 'kawasaki-king-k9-badminton-racket',
  },
  apacs: {
    'fantala-60-speed': 'apacs-fantala-60-speed-badminton-racket',
    'z-ziggler': 'apacs-z-ziggler-badminton-racket',
  },
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

async function main() {
  let success = 0, fail = 0

  for (const [brand, slugMap] of Object.entries(SLUGS)) {
    const brandDir = path.join(OUTPUT, brand)
    fs.mkdirSync(brandDir, { recursive: true })

    for (const [fileName, slug] of Object.entries(slugMap)) {
      const outPath = path.join(brandDir, `${fileName}.jpg`)
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
        continue
      }

      try {
        const jsonUrl = `https://${SITE}/products/${slug}.json`
        const jsonStr = await fetchJSON(jsonUrl)
        const data = JSON.parse(jsonStr)
        const product = data.product || data
        const images = product.images || []
        if (images.length === 0) throw new Error('no images')
        const imgUrl = images[0].src || images[0]
        const fullUrl = imgUrl.replace(/^http:/, 'https:').split('?')[0] + '?width=1200'
        execSync(`curl -sL -o "${outPath}" "${fullUrl}"`, { timeout: 15000 })
        const stats = fs.statSync(outPath)
        if (stats.size > 5000) {
          success++
          console.log(`  ✓ ${brand}/${fileName}.jpg (${(stats.size/1024).toFixed(0)}KB)`)
        } else {
          fail++
          console.log(`  ✗ ${brand}/${fileName}.jpg (too small)`)
        }
      } catch (e) {
        fail++
        console.log(`  ✗ ${brand}/${fileName}.jpg (${e.message})`)
      }
    }
  }

  console.log(`\nDone: ${success} ok, ${fail} failed`)
}

main().catch(console.error)
