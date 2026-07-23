const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const COOKIE_PATH = path.join(__dirname, '.taobao-cookies.json')
const JSON_PATH = path.join(__dirname, 'equipment-data.json')
const OUTPUT_BASE = path.join(__dirname, '..', 'static', 'models')

const BRAND_CN = {
  Yonex: '尤尼克斯',
  Victor: '威克多',
  'Li-Ning': '李宁',
  Kawasaki: '川崎',
  Kason: '凯胜',
  Babolat: '百宝力',
  Carlton: '卡尔顿',
  'FZ Forza': '福瑞斯',
  Apacs: '阿帕斯',
  'Fleet/Felet': '富力特',
  Bonny: '波力',
  RSL: '亚狮龙',
  DHS: '红双喜',
  KUMPOO: '薰风',
  GOSEN: '高神',
}

const IMAGES_PER_MODEL = 3
const PAUSE_BETWEEN_SEARCHES = 10000

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function log(msg) {
  const ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  console.log(`[${ts}] ${msg}`)
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function brandDir(brand) {
  return brand.toLowerCase().replace(/[/\s]+/g, '-')
}

function getExistingImageCount(brand, model) {
  const dir = path.join(OUTPUT_BASE, brandDir(brand))
  if (!fs.existsSync(dir)) return 0
  const slug = slugify(model)
  return fs.readdirSync(dir).filter(f =>
    f.startsWith(slug + '.') || f.startsWith(slug + '-')
  ).length
}

/**
 * Download N product images from the current search results page.
 * Uses element screenshots - the browser already loaded these images,
 * so no HTTP 404 issues with CDN URLs.
 */
async function captureProductImages(page, brand, model) {
  const slug = slugify(model)
  const dir = path.join(OUTPUT_BASE, brandDir(brand))
  fs.mkdirSync(dir, { recursive: true })

  const existingCount = getExistingImageCount(brand, model)
  if (existingCount >= IMAGES_PER_MODEL) {
    log(`  SKIP: ${model} (${existingCount} images exist)`)
    return 0
  }

  // Scroll down to trigger lazy-loaded images
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 800))
    await sleep(random(800, 1500))
  }

  // Find candidate img elements - filter by displayed size
  // Product images on search results are 150-400px; tracking pixels are tiny
  const candidates = await page.evaluate(() => {
    const results = []
    const imgs = document.querySelectorAll('img')
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i]
      const rect = img.getBoundingClientRect()
      const src = img.src || img.getAttribute('data-src') || ''
      if (rect.width >= 120 && rect.height >= 120 && src.includes('alicdn.com')) {
        results.push({ index: i, width: rect.width, height: rect.height, src: src.substring(0, 60) })
      }
    }
    return results
  })

  if (candidates.length === 0) {
    log(`    No product images found`)
    return 0
  }

  log(`    ${candidates.length} product images on page`)

  // Screenshot the first N unique candidates
  let saved = 0
  const allImgs = await page.$$('img')
  for (let i = 0; i < candidates.length && saved < (IMAGES_PER_MODEL - existingCount); i++) {
    const cand = candidates[i]
    const imgEl = allImgs[cand.index]
    if (!imgEl) continue

    const idx = existingCount + saved + 1
    const filename = idx === 1 ? `${slug}.jpg` : `${slug}-${idx}.jpg`
    const outputPath = path.join(dir, filename)

    try {
      await imgEl.scrollIntoViewIfNeeded()
      await sleep(300)
      await imgEl.screenshot({ path: outputPath, type: 'jpeg', quality: 85 })
      const size = fs.statSync(outputPath).size
      if (size > 2000) {
        log(`    SAVED: ${filename} (${(size / 1024).toFixed(0)} KB, ${cand.width}x${cand.height})`)
        saved++
      } else {
        fs.unlinkSync(outputPath)
      }
    } catch (e) {
      // element may be detached or not visible, skip
    }
  }
  return saved
}

async function searchOneModel(page, brand, brandCn, model) {
  const keyword = `${brandCn} ${model} 羽毛球拍`
  const url = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
  await sleep(random(3000, 5000))

  // Anti-bot challenge check
  const bodyText = await page.evaluate(() => {
    const b = document.body
    return b ? b.innerText.substring(0, 500) : ''
  }).catch(() => '')

  if (/验证|滑块|卖家交流|滑动|拖动|安全认证|访问受限|异常访问|请稍后再试|操作频繁/.test(bodyText)) {
    log('  *** Challenge detected! Please solve in browser ***')
    try {
      await page.waitForFunction(() =>
        document.querySelectorAll('img').length > 10, { timeout: 300000 })
      log('  Challenge solved')
      await sleep(2000)
    } catch {
      log('  Challenge timeout, skipping')
      return 0
    }
  }

  return captureProductImages(page, brand, model)
}

async function main() {
  // Read racket models from equipment-data.json
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  const rackets = data.rackets || {}

  const brandModels = {}
  let totalModels = 0
  for (const [brand, brandData] of Object.entries(rackets)) {
    if (!brandData.series || !BRAND_CN[brand]) continue
    const models = []
    for (const series of Object.values(brandData.series)) {
      for (const m of series.models || []) models.push(m)
    }
    if (models.length > 0) {
      brandModels[brand] = models
      totalModels += models.length
    }
  }
  log(`${totalModels} models across ${Object.keys(brandModels).length} brands`)

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'zh-CN',
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  // Login
  if (fs.existsSync(COOKIE_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf8'))
    await context.addCookies(cookies)
    log('Cookies loaded')
  }
  await page.goto('https://www.taobao.com/', { waitUntil: 'load', timeout: 30000 }).catch(() => {})
  await sleep(3000)
  const loggedIn = await page.evaluate(() => {
    const b = document.body
    return b && (b.innerText.includes('我的淘宝') || b.innerText.includes('已买到'))
  }).catch(() => false)

  if (!loggedIn) {
    if (fs.existsSync(COOKIE_PATH)) fs.unlinkSync(COOKIE_PATH)
    log('Need login — scan QR code')
    await page.goto('https://login.taobao.com/', { waitUntil: 'load', timeout: 30000 }).catch(() => {})
    await sleep(2000)
    await page.waitForFunction(() => !window.location.href.includes('login.taobao.com'), { timeout: 300000 }).catch(() => {})
    const cookies = await context.cookies()
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
    log('Login done')
  } else {
    log('Session valid')
  }

  let totalSaved = 0
  let processed = 0

  for (const [brand, models] of Object.entries(brandModels)) {
    const brandCn = BRAND_CN[brand]
    log(`\n========== ${brand} (${brandCn}) - ${models.length} models ==========`)

    for (const model of models) {
      processed++
      log(`\n[${processed}/${totalModels}] ${model}`)

      const saved = await searchOneModel(page, brand, brandCn, model)
      totalSaved += saved

      // 10s pause between searches
      if (processed < totalModels) await sleep(PAUSE_BETWEEN_SEARCHES)
    }

    // Save cookies periodically
    const cookies = await context.cookies()
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
  }

  log(`\n========================================`)
  log(`Done: ${totalSaved} images saved from ${processed} models`)
  await browser.close()
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
