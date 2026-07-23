const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const COOKIE_PATH = path.join(__dirname, '.taobao-cookies.json')
const OUTPUT_PATH = path.join(__dirname, 'taobao-models-output.json')

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function log(msg) {
  const ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  console.log(`[${ts}] ${msg}`)
}

const KNOWN_MODELS = {
  'Fleet/Felet': ['Woven 1000 III', 'TJ Power', 'TJ Tech Racer', 'Hyperion', 'Aero Mars', 'Blink Sword', 'High Tension 68', 'Professional 8000'],
  Babolat: ['X-Feel Blast', 'X-Feel Origin', 'X-Feel Power', 'Satelite Blast', 'Satelite Gravity', 'Satelite Lite', 'Satelite Touch', 'I-Pulse Blast', 'I-Pulse Power'],
  Carlton: ['Kinesis Ultra', 'Kinesis X90', 'Kinesis Enhance', 'Kinesis Rapid', 'Vapour Trail Pure', 'Vapour Trail Vanquish', 'Powerblade Superlite', 'Fireblade 300', 'Aeroblade 6000', 'Isoblade'],
  'FZ Forza': ['Precision 12000', 'Precision 10000', 'Precision 8000', 'Precision X1', 'Precision X3', 'Precision X5', 'Power 999', 'Power 988', 'Power 576', 'Light 10', 'Light 9', 'Light 6', 'N Force', 'CNT Power'],
  Apacs: ['Fantala', 'Feather Weight 75', 'Feather Weight 65', 'Feather 100', 'Z Ziggler', 'Lethal 10', 'Lethal 9', 'Woven Aggressive', 'Woven Control', 'Nano Fusion Speed', 'Nano 9900', 'Asgardia', 'Blend 6000', 'Dual Power Speed'],
  DHS: ['M-Racket', 'Shining', 'Aeroplane'],
}

const BRANDS = [
  { name: 'Yonex', cn: '尤尼克斯', series: [
    '天斧:Astrox', '疾光:Nanoflare', '弓剑:Arcsaber', '双刃:Duora', '锐速:Nanoray', '威力:Voltric'
  ], enSeries: ['ASTROX', 'NANOFLARE', 'ARCSABER', 'DUORA', 'NANORAY', 'VOLTRIC'] },
  { name: 'Victor', cn: '威克多', series: [
    '亮剑:Brave Sword', '神速:Auraspeed', '驭:DriveX', '极速:Jetspeed',
    '黑金隼:Thruster', '龙牙:Thruster Ryuga', '猛禽:Thruster Raptor',
    '大熊座:Thruster Merak', '猎鹰:Thruster K Falcon'
  ], enSeries: ['AURASPEED', 'THRUSTER', 'DRIVEX', 'JETSPEED', 'BRAVE'] },
  { name: 'Li-Ning', cn: '李宁', series: [
    '雷霆:Axforce', '风刃:Bladex', '战戟:Halbertec', '风动:Aeronaut',
    '风影:Windstorm', '突袭:Tectonic', '能量:Calibar'
  ], enSeries: ['AXFORCE', 'BLADEX', 'HALBERTEC', 'AERONAUT', 'WINDSTORM', 'TECTONIC', 'CALIBAR'] },
  { name: 'Kawasaki', cn: '川崎', series: [
    '荣耀:Honor', '王者:King', '大师:Master', '蜘蛛:Spider',
    '闪电:Lightning', '超轻:Super Light', '探索:Explore', '核速:Corespeed'
  ]},
  { name: 'Kason', cn: '凯胜', series: [
    '风羽:Feather', '火力:Force', '汤仙虎:TSF', '旋风:Twister'
  ]},
  { name: 'Bonny', cn: '波力', series: [
    '斩鬼刀:Classic Carbon', '幻影:Phantom', '雷速:Thunder Speed', '影速:Shadow Speed',
    '剑影:Sword Shadow', '龙鳞之刃:Dragon Blade', '玄武:Black Tortoise',
    '白帝:White Emperor', '朱雀:Vermilion Bird', '王子:Prince',
    '魔君:Majun', '极星:Polaris', '战神:Warrior', '钢铁之翼:Steel Wings',
    '轻羽:Light Feather', '虎翼:Tiger Wings', '武者:Warrior', '云鹏:Cloud Roc', '极光:Aurora'
  ]},
  { name: 'KUMPOO', cn: '薰风', series: [
    '魔王:Devil', '修罗:Shura', '豹:Leopard', '厚羿:Houyi',
    '探索者:Explorer', '涡轮:Turbo', '银狐:Silver Fox', '乘风:Chengfeng',
    '劲松:Jinsong', '蚀日:Shi Ri', '狂蟒:Kuangshen', '国伦:Guolun'
  ]},
  { name: 'GOSEN', cn: '高神', series: [
    '魅剑:Inferno', '凌驾:Roots', '定角:Customedge', '永恒之枪:Gungnir',
    '莲花:Lotus', '雷音:Ryzonic'
  ]},
  { name: 'RSL', cn: '亚狮龙', series: [
    '脉冲:Pulse', '锦标赛:Tourney', '终极:Ultimate', '至尊:Supreme', '经典锦标赛:Classic Tourney'
  ]},
  { name: 'DHS', cn: '红双喜', series: [
    '魔拍:M-Racket', '闪光:Shining', '航空:Aeroplane'
  ]},
  { name: 'Fleet/Felet', cn: '富力特', series: [] },
  { name: 'Babolat', cn: '百宝力', series: [] },
  { name: 'Carlton', cn: '卡尔顿', series: [] },
  { name: 'FZ Forza', cn: '福瑞斯', series: [] },
  { name: 'Apacs', cn: '阿帕斯', series: [] },
]

function extractModels(titles, brandConfig) {
  const found = new Set()
  for (const title of titles) {
    if (brandConfig.series.length > 0) {
      for (const s of brandConfig.series) {
        const [cn, en] = s.split(':')
        const re = new RegExp(`${cn}[\\u4e00-\\u9fff]*\\s*((?:[A-Za-z0-9]+[\\s-]?)+)`, 'ig')
        let m
        while ((m = re.exec(title)) !== null) {
          const code = m[1].trim()
          if (code && code.length >= 1 && code.length <= 30) {
            found.add(`${brandConfig.name}||${en}||${code}||${cn}`)
          }
        }
      }
    }
    if (brandConfig.enSeries && brandConfig.enSeries.length > 0) {
      for (const enName of brandConfig.enSeries) {
        const re = new RegExp(`${enName}\\s+((?:[A-Za-z0-9]+[\\s-]?)+)`, 'ig')
        let m
        while ((m = re.exec(title)) !== null) {
          const code = m[1].trim()
          if (code && code.length >= 1 && code.length <= 30) {
            found.add(`${brandConfig.name}||${enName}||${code}||${enName}`)
          }
        }
      }
    }
    if (!brandConfig.series.length && !brandConfig.enSeries) {
      const known = KNOWN_MODELS[brandConfig.name] || []
      for (const model of known) {
        const norm = model.toLowerCase().replace(/[\s-]/g, '')
        if (title.toLowerCase().replace(/[\s-]/g, '').includes(norm)) {
          found.add(`${brandConfig.name}||${model}||||`)
        }
      }
      const re = new RegExp(`${brandConfig.cn}[\\u4e00-\\u9fff\\s]*([A-Z][A-Za-z]?[\\s-]?\\d{2,}[A-Za-z]*)`, 'ig')
      let m
      while ((m = re.exec(title)) !== null) {
        const code = m[1].trim()
        if (code && code.length >= 2 && code.length <= 15) {
          found.add(`${brandConfig.name}||${brandConfig.name}||${code}||`)
        }
      }
    }
  }
  return [...found]
}

function cleanModels(rawModels) {
  const seen = new Map()
  const knownAlpha = ['AXNT','NEXTAGE','NT','AXNEXT','METALLIC','ULTRA','SE','PGS','HS','FANTOME','PRO','II','LHI','ACE','ELITE','MAX','TOUR','PLAY','GAME','TTY','NEXTAGE']
  for (const raw of rawModels) {
    const parts = raw.split('||')
    if (parts.length < 3) continue
    const prefix = parts[1], codeFull = parts[2] || '', cnRef = parts[3] || ''
    if (!codeFull && prefix) {
      const k = prefix.toLowerCase()
      if (!seen.has(k)) seen.set(k, { en: prefix, cn: '' })
      continue
    }
    const codes = codeFull.split(/\s+/).filter(w => {
      if (w.length < 2) return false
      if (!/\d/.test(w) && !knownAlpha.includes(w.toUpperCase()) && w.length < 3) return false
      if (/^\d+g/i.test(w) || /^g\d/i.test(w)) return false
      if (/^(YONEX|yonex|YY|yy|VICTOR|victor)$/i.test(w)) return false
      return true
    })
    for (const code of codes) {
      const display = `${prefix} ${code}`
      const cnDisplay = cnRef ? `${cnRef}${code}` : code
      const k = display.toLowerCase()
      if (!seen.has(k) || display.length < seen.get(k).en.length) {
        seen.set(k, { en: display, cn: cnDisplay })
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.en.localeCompare(b.en))
}

async function humanBrowse(page) {
  for (let i = 0; i < random(2, 3); i++) {
    try {
      const hasBody = await page.evaluate(() => !!document.body)
      if (!hasBody) return
      await page.evaluate((amt) => window.scrollBy(0, amt), random(200, 500))
      await sleep(random(300, 1000))
    } catch {}
  }
  try {
    await page.evaluate(() => { const b = document.body; if (b) window.scrollTo(0, b.scrollHeight) })
  } catch {}
  await sleep(random(500, 1500))
}

async function extractTitles(page) {
  return await page.evaluate(() => {
    const seen = new Set(), res = []
    document.querySelectorAll('a[href*="item.htm"], a[href*="detail"]').forEach(a => {
      const t = (a.getAttribute('title') || a.textContent || '').trim()
      if (t.length > 10 && !seen.has(t)) { seen.add(t); res.push(t) }
    })
    return res
  })
}

async function searchOneBrand(page, brandConfig) {
  const keyword = `${brandConfig.cn} 羽毛球拍`
  log(`\n=== ${brandConfig.name} (${brandConfig.cn}) ===`)

  const allTitles = []
  const allRawModels = new Set()
  let pageNum = 0, dryPages = 0, maxPages = 10

  while (pageNum < maxPages) {
    pageNum++
    const offset = (pageNum - 1) * 44
    const url = offset === 0
      ? `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`
      : `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}&s=${offset}`
    log(`  Page ${pageNum}/${maxPages}`)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await sleep(random(3000, 5000))

    // Challenge check
    const bodyText = await page.evaluate(() => {
      const b = document.body; return b ? b.innerText.substring(0, 200) : ''
    }).catch(() => '')
    if (/验证|滑块|卖家交流|滑动|拖动|安全认证/.test(bodyText)) {
      log('  Challenge! Waiting...')
      try {
        await page.waitForFunction(() =>
          document.querySelectorAll('a[href*="item.htm"]').length > 5,
          { timeout: 300000 }
        )
      } catch {}
    }

    await humanBrowse(page)

    const pageTitles = await extractTitles(page)
    for (const t of pageTitles) {
      if (!allTitles.includes(t)) allTitles.push(t)
    }

    const beforeModels = allRawModels.size
    const pageModels = extractModels(pageTitles, brandConfig)
    for (const m of pageModels) allRawModels.add(m)
    const newModels = allRawModels.size - beforeModels

    if (newModels === 0) { dryPages++ } else { dryPages = 0 }
    log(`    ${pageTitles.length} titles | ${allTitles.length} uniq | ${allRawModels.size} models (+${newModels}) | dry:${dryPages}`)

    if (dryPages >= 5) { log(`    5 dry pages, stopping`); break }
    if (pageNum >= maxPages) {
      if (newModels >= 3) { maxPages += 3; dryPages = 0; log(`    Extending to ${maxPages}p`) }
      else { log(`    Reached ${maxPages}p, stopping`); break }
    }
    await sleep(random(8000, 12000))
  }

  const finalModels = cleanModels([...allRawModels])
  return { brand: brandConfig.name, titles: allTitles.length, pages: pageNum, models: finalModels }
}

function loadExisting() {
  if (fs.existsSync(OUTPUT_PATH)) {
    try { return JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')) }
    catch { return {} }
  }
  return {}
}

function mergeModels(existing, newModels) {
  const merged = new Set(existing || [])
  for (const m of newModels) merged.add(m)
  return [...merged].sort()
}

async function main() {
  const existing = loadExisting()
  if (Object.keys(existing).length > 0) log(`Loaded existing output (${Object.keys(existing).length} brands)`)

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

  if (loggedIn) {
    log('Session valid')
  } else {
    if (fs.existsSync(COOKIE_PATH)) fs.unlinkSync(COOKIE_PATH)
    log('Need login — scan QR code in browser')
    await page.goto('https://login.taobao.com/', { waitUntil: 'load', timeout: 30000 }).catch(() => {})
    await sleep(2000)
    await page.waitForFunction(
      () => !window.location.href.includes('login.taobao.com'),
      { timeout: 300000 }
    ).catch(() => {})
    const cookies = await context.cookies()
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
    log('Login done, cookies saved')
  }

  const allResults = { ...existing }
  for (let i = 0; i < BRANDS.length; i++) {
    const brandConfig = BRANDS[i]
    try {
      const result = await searchOneBrand(page, brandConfig)
      const mergedModels = mergeModels(
        existing[brandConfig.name]?.models,
        result.models.map(m => `${m.en}(${m.cn})`)
      )
      allResults[brandConfig.name] = {
        pages: result.pages,
        titles: result.titles,
        models: mergedModels,
      }
      log(`  => ${result.models.length} new, ${mergedModels.length} merged`)
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2))
      await sleep(random(15000, 25000))
    } catch (e) {
      log(`  ERROR: ${e.message}`)
      allResults[brandConfig.name] = existing[brandConfig.name] || { pages: 0, titles: 0, models: [] }
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2))
    }
  }

  log(`\nDone: ${Object.keys(allResults).length} brands`)
  for (const [name, data] of Object.entries(allResults)) {
    log(`  ${name}: ${data.models.length} models (${data.pages}p, ${data.titles}t)`)
  }
  log(`\nOutput: ${OUTPUT_PATH}`)
  await browser.close()
}

main().catch(err => { console.error('Error:', err.message); process.exit(1) })
