const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')

const OUTPUT_DIR = '/tmp/models'

const MODELS = {
  Yonex: {
    site: 'us.yonex.com',
    paths: {
      'Astrox 100ZZ': 'astrox-100zz',
      'Astrox 99 Pro': 'astrox-99-pro',
      'Astrox 88D Pro': 'astrox-88d-pro',
      'Astrox 88S Pro': 'astrox-88s-pro',
      'Astrox 77 Pro': 'astrox-77-pro',
      'Nanoflare 1000Z': 'nanoflare-1000z',
      'Nanoflare 800 Pro': 'nanoflare-800-pro',
      'Nanoflare 700 Pro': 'nanoflare-700-pro',
      'Arcsaber 11 Pro': 'arcsaber-11-pro',
      'Arcsaber 7 Pro': 'arcsaber-7-pro',
      'Power Cushion 65 Z3': 'power-cushion-65-z3',
      'Power Cushion Aerus Z2': 'power-cushion-aerus-z2',
      'Power Cushion Eclipsion Z3': 'power-cushion-eclipsion-z3',
      'Pro Racquet Bag (9R)': 'pro-racquet-bag-9r',
      'Aerosensa 50 (AS-50)': 'aerosensa-50',
      'Aerosensa 30 (AS-30)': 'aerosensa-30',
    },
  },
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }))
    }).on('error', reject)
  })
}

function extractOgImage(html) {
  const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)
  return match ? match[1] : null
}

async function downloadWithCurl(url, outputPath) {
  try {
    execSync(`curl -sL -o "${outputPath}" "${url}"`, { timeout: 15000 })
    const stats = fs.statSync(outputPath)
    if (stats.size > 1000) {
      console.log(`  Saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`)
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

async function processModel(brandName, site, modelName, slug) {
  const url = `https://${site}/products/${slug}`
  const brandDir = site.split('.')[0]
  const outDir = path.join(OUTPUT_DIR, brandDir.toLowerCase())
  fs.mkdirSync(outDir, { recursive: true })
  const outputPath = path.join(outDir, `${slug}.jpg`)

  console.log(`\n--- ${brandName} ${modelName} ---`)
  console.log(`URL: ${url}`)

  try {
    const result = await fetchUrl(url)
    const imgUrl = extractOgImage(result.data)

    if (!imgUrl) {
      console.log('  No og:image found')
      return false
    }

    // Force https if needed
    const fullUrl = imgUrl.replace(/^http:/, 'https:').split('?')[0]
      .replace(/_\d+x\d+\./, '.') + '?width=1200'

    console.log(`  Image: ${fullUrl}`)

    const ok = await downloadWithCurl(fullUrl, outputPath)
    if (!ok) {
      console.log('  Download failed or too small')
      return false
    }
    return true
  } catch (e) {
    console.log(`  Error: ${e.message}`)
    return false
  }
}

async function main() {
  let success = 0
  let fail = 0

  for (const [brandName, config] of Object.entries(MODELS)) {
    for (const [modelName, slug] of Object.entries(config.paths)) {
      const ok = await processModel(brandName, config.site, modelName, slug)
      if (ok) success++
      else fail++
    }
  }

  console.log(`\nDone: ${success} succeeded, ${fail} failed`)
}

main().catch(console.error)
