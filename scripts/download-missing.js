const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')

const OUTPUT_DIR = '/tmp/models'

const MISSING = {
  'Yonex-Nanoflare 1000Z': { url: 'https://us.yonex.com/products/nanoflare-1000z', slug: 'nanoflare-1000z', site: 'us.yonex.com' },
  'Yonex-Nanoflare 800 Pro': { url: 'https://us.yonex.com/products/nanoflare-800-pro', slug: 'nanoflare-800-pro', site: 'us.yonex.com' },
  'Yonex-Power Cushion 65 Z3': { url: 'https://us.yonex.com/products/power-cushion-65-z3', slug: 'power-cushion-65-z3', site: 'us.yonex.com' },
  'Yonex-Power Cushion Aerus Z2': { url: 'https://us.yonex.com/products/power-cushion-aerus-z2', slug: 'power-cushion-aerus-z2', site: 'us.yonex.com' },
  'Yonex-Power Cushion Eclipsion Z3': { url: 'https://us.yonex.com/products/power-cushion-eclipsion-z3', slug: 'power-cushion-eclipsion-z3', site: 'us.yonex.com' },
  'Yonex-Pro Racquet Bag (9R)': { url: 'https://us.yonex.com/products/pro-racquet-bag-9r', slug: 'pro-racquet-bag-9r', site: 'us.yonex.com' },
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// Extract all image URLs from Shopify product page JSON
function extractProductImages(html) {
  const images = []
  // Try to find product JSON in Shopify's structured data
  const ldJson = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/g)
  if (ldJson) {
    for (const block of ldJson) {
      try {
        const json = JSON.parse(block.replace(/<script[^>]+>/, '').replace('</script>', ''))
        if (json.image) {
          if (Array.isArray(json.image)) images.push(...json.image)
          else images.push(json.image)
        }
      } catch (e) {}
    }
  }

  // Also find all product images from OG tags or meta
  const metaImg = html.match(/<meta[^>]+(?:property="og:image"[^>]+content="([^"]+)"|content="([^"]+)"[^>]+property="og:image")/i)
  if (metaImg) images.push(metaImg[1] || metaImg[2])

  // Find any large product images in meta
  const twitterImg = html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)
  if (twitterImg) images.push(twitterImg[1])

  // Find image URLs in <img> tags with product-related classes
  const imgTags = html.match(/<img[^>]+src="([^"]+)"[^>]*>/g)
  if (imgTags) {
    for (const tag of imgTags) {
      const src = tag.match(/src="([^"]+)"/)
      if (src && src[1].includes('/cdn/shop/files/')) {
        images.push(src[1])
      }
    }
  }

  return [...new Set(images)]
}

async function download(url, outputPath) {
  try {
    execSync(`curl -sL -o "${outputPath}" "${url}"`, { timeout: 15000 })
    const stats = fs.statSync(outputPath)
    return stats.size > 1000
  } catch (e) {
    return false
  }
}

async function main() {
  for (const [name, item] of Object.entries(MISSING)) {
    const brandDir = item.site.split('.')[0]
    const outDir = path.join(OUTPUT_DIR, brandDir.toLowerCase())
    fs.mkdirSync(outDir, { recursive: true })
    const outputPath = path.join(outDir, `${item.slug}.jpg`)

    console.log(`\n--- ${name} ---`)
    console.log(`URL: ${item.url}`)

    try {
      const html = await fetchUrl(item.url)
      const images = extractProductImages(html)

      console.log(`  Found ${images.length} image references`)

      let downloaded = false
      for (const img of images) {
        const fullUrl = img.replace(/^http:/, 'https:').replace(/\?.*$/, '')
          .replace(/_\d+x\d+\./, '.') + '?width=1200'
        console.log(`  Trying: ${fullUrl}`)
        if (await download(fullUrl, outputPath)) {
          const stats = fs.statSync(outputPath)
          console.log(`  Saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`)
          downloaded = true
          break
        }
      }

      if (!downloaded) {
        console.log('  All attempts failed')
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`)
    }
  }

  console.log('\nDone')
}

main().catch(console.error)
