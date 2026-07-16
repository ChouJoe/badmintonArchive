/**
 * Badminton Equipment Database
 * Comprehensive brands and models for rackets, shoes, bags, and shuttles
 * Organized by type → brand → models
 */

const brands = {
  racket: [
    {
      name: 'Yonex',
      logo: '/static/brands/yonex.svg',
      models: [
        'Astrox 100ZZ', 'Astrox 99 Pro', 'Astrox 99 Tour', 'Astrox 99 Game', 'Astrox 99 Play',
        'Astrox 88D Pro', 'Astrox 88D Tour', 'Astrox 88D Game', 'Astrox 88D Play',
        'Astrox 88S Pro', 'Astrox 88S Tour', 'Astrox 88S Game', 'Astrox 88S Play',
        'Astrox 77 Pro', 'Astrox 77 Tour', 'Astrox 77 Game', 'Astrox 77 Play',
        'Astrox 70', 'Astrox Nextage',
        'Nanoflare 1000Z', 'Nanoflare 1000 Tour', 'Nanoflare 1000 Game', 'Nanoflare 1000 Play',
        'Nanoflare 800 Pro', 'Nanoflare 800 Tour', 'Nanoflare 800 Game', 'Nanoflare 800 Play',
        'Nanoflare 700 Pro', 'Nanoflare 700 Tour', 'Nanoflare 700 Game', 'Nanoflare 700 Play',
        'Nanoflare 555', 'Nanoflare 380', 'Nanoflare 370 Speed',
        'Arcsaber 11 Pro', 'Arcsaber 11 Tour', 'Arcsaber 11 Play',
        'Arcsaber 7 Pro', 'Arcsaber 7 Tour', 'Arcsaber 7 Play'
      ]
    },
    {
      name: 'Li-Ning',
      logo: '/static/brands/lining.svg',
      models: [
        'Axforce 90 Max Tiger', 'Axforce 90 Max Dragon', 'Axforce 100 II', 'Axforce 80',
        'Axforce 80 Light', 'Axforce 70', 'Axforce 50', 'Axforce 40', 'Axforce 30', 'Axforce 20',
        'Axforce Cannon', 'Axforce Cannon Pro',
        'Bladex 900 Max Sun', 'Bladex 900 Max Moon', 'Bladex 800', 'Bladex 700', 'Bladex 500',
        'Bladex 200', 'Bladex 100',
        'Halbertec 9000', 'Halbertec 8000', 'Halbertec 7000', 'Halbertec 5000', 'Halbertec 3000', 'Halbertec 2000',
        'Aeronaut 9000', 'Aeronaut 8000', 'Aeronaut 7000',
        'Windstorm 72', 'Windstorm 79', 'Windstorm 74',
        'Tectonic 7', 'Tectonic 9', 'Calibar 300'
      ]
    },
    {
      name: 'Victor',
      logo: '/static/brands/victor.png',
      models: [
        'Auraspeed 90K Metallic', 'Auraspeed 90K II', 'Auraspeed 100X Ultra',
        'Auraspeed HS Plus', 'Auraspeed Fantôme', 'Auraspeed PGS',
        'Auraspeed 90F', 'Auraspeed 100X', 'Auraspeed 99', 'Auraspeed 90S',
        'Thruster F C Ultra X', 'Thruster F Ultra', 'Thruster Ryuga II Pro',
        'Thruster Ryuga Metallic', 'Thruster Raptor', 'Thruster Merak',
        'Thruster K Falcon', 'Thruster K 12', 'Thruster K 1H',
        'DriveX 12', 'DriveX 10 Metallic', 'DriveX 8S', 'DriveX 9X', 'DriveX 1',
        'Jetspeed S 12 II', 'Jetspeed S 12 F', 'Jetspeed S 10',
        'Brave Sword 12', 'Brave Sword 12 Pro', 'Brave Sword LHI'
      ]
    },
    {
      name: 'Kawasaki',
      logo: '/static/brands/kawasaki.svg',
      models: [
        'Honor S6', 'Honor S5', 'King K9', 'King K8', 'King K7',
        'Master Mao 18 II', 'Master Mao 19', 'Master 800',
        'Spider 9900 II', 'Spider 9000', 'Spider 7000',
        'Lightning 8800', 'Super Light 6820',
        'Explore 1500i', 'Corespeed 80F', 'Corespeed 70F'
      ]
    },
    {
      name: 'Kason',
      logo: '/static/brands/kason.svg',
      models: [
        'Feather K600', 'Feather K520', 'Feather K9', 'Feather K8',
        'Force T210', 'Force T110', 'TSF 300',
        'Twister', 'B110', 'C7-PT'
      ]
    },
    {
      name: 'Babolat',
      logo: '/static/brands/babolat.svg',
      models: [
        'X-Feel Blast', 'X-Feel Origin', 'X-Feel Origin Lite', 'X-Feel Power',
        'Satelite Blast', 'Satelite Gravity 74', 'Satelite Lite', 'Satelite Touch',
        'I-Pulse Blast', 'I-Pulse Power', '6.5 Lite S'
      ]
    },
    {
      name: 'Carlton',
      logo: '/static/brands/carlton.svg',
      models: [
        'Kinesis Ultra', 'Kinesis X90', 'Kinesis Enhance 70', 'Kinesis Rapid',
        'Vapour Trail Pure', 'Vapour Trail Vanquish',
        'Powerblade Superlite', 'Fireblade 300',
        'Aeroblade 6000', 'Isoblade 6.1'
      ]
    },
    {
      name: 'FZ Forza',
      logo: '/static/brands/forza.png',
      models: [
        'Precision 12000 VS', 'Precision 10000 VS', 'Precision 8000 VS',
        'Precision X1', 'Precision X3', 'Precision X5',
        'Power 999', 'Power 988', 'Power 576',
        'Light 10.1', 'Light 9.1', 'Light 6.1',
        'N Force', 'CNT Power 1.0'
      ]
    },
    {
      name: 'Apacs',
      logo: '/static/brands/apacs.jpg',
      models: [
        'Fantala 6.0 Speed', 'Fantala 6.0 Control',
        'Feather Weight 75', 'Feather Weight 65', 'Feather 100',
        'Z Ziggler', 'Lethal 10', 'Lethal 9',
        'Woven Aggressive', 'Woven Control',
        'Nano Fusion Speed XR', 'Nano 9900',
        'Asgardia', 'Blend 6000', 'Dual Power Speed'
      ]
    },
    {
      name: 'Fleet/Felet',
      logo: '/static/brands/fleet.svg',
      models: [
        'Woven 1000 III', 'TJ Power', 'TJ Tech Racer 1',
        'Hyperion', 'Aero Mars', 'Blink Sword',
        'High Tension 68 II', 'Professional 8000'
      ]
    }
  ],
  shoes: [
    {
      name: 'Yonex',
      logo: '/static/brands/yonex.svg',
      models: [
        'Power Cushion 65 Z3', 'Power Cushion 65 Z2', 'Power Cushion 65 Z Wide',
        'Power Cushion Aerus Z2', 'Power Cushion Aerus Z',
        'Power Cushion Eclipsion Z3', 'Power Cushion Eclipsion Z2',
        'Power Cushion Comfort Z3', 'Power Cushion Comfort Z2',
        'Power Cushion 88 Dial 3', 'Power Cushion 88 Dial 2',
        'Power Cushion Cascade Accel', 'Power Cushion SHB-50'
      ]
    },
    {
      name: 'Victor',
      logo: '/static/brands/victor.svg',
      models: [
        'P9200 III', 'P9200 II', 'P9200 TTY',
        'A970 Ace', 'A960', 'A950',
        'S82 III', 'S82 II', 'S99 Elite',
        'P8500 II', 'A790', 'A780',
        'VG2 Ace', 'AS-30'
      ]
    },
    {
      name: 'Li-Ning',
      logo: '/static/brands/lining.svg',
      models: [
        'Saga Pro', 'Saga Lite', 'Saga II',
        'Ranger TD', 'Ranger IV', 'Blade Pro',
        'BladeX DF-01 Max', 'BladeSabre Max',
        'Mirage SE', 'Cloud Ace Pro', 'Cloud Ace',
        'All-Round King', 'Yun Ting', 'Cai Fei'
      ]
    },
    {
      name: 'Mizuno',
      logo: '/static/brands/mizuno.svg',
      models: [
        'Wave Fang Pro', 'Wave Fang Zero 2', 'Wave Fang NX',
        'Wave Claw Neo 3', 'Wave Claw Neo 2', 'Wave Claw 3',
        'Wave Claw 2', 'Wave Claw EL 2'
      ]
    },
    {
      name: 'ASICS',
      logo: '/static/brands/asics.svg',
      models: [
        'Gel-Blade 8', 'Gel-Blade 7',
        'Gel-Rocket 11', 'Gel-Rocket 10',
        'Court Control FF 3', 'Court Control FF 2',
        'Blast FF', 'Upcourt 5', 'Upcourt 4',
        'Gel-Tactic', 'Gel-Court Hunter'
      ]
    }
  ],
  bag: [
    {
      name: 'Yonex',
      logo: '/static/brands/yonex.svg',
      models: [
        'Pro Racquet Bag (9R)', 'Pro Racquet Bag (6R)',
        'Pro Tournament Bag', 'Pro Backpack L', 'Pro Backpack M',
        'Expert Racquet Bag (6R)',
        'Team Racquet Bag (6R)', 'Team Backpack',
        'Active Racquet Bag (6R)', 'Club Racquet Bag',
        'Pro Support Backpack'
      ]
    },
    {
      name: 'Li-Ning',
      logo: '/static/brands/lining.svg',
      models: [
        'Professional 9R Bag', 'Professional 6R Bag',
        'Professional Backpack', 'Standard 6R Bag',
        'Standard 3R Bag', 'Standard Backpack',
        'Shuttle Bag', 'Tournament Bag'
      ]
    },
    {
      name: 'Victor',
      logo: '/static/brands/victor.svg',
      models: [
        'Supreme Multithermobag (12R)', 'Supreme Multithermobag (9R)',
        'Flash Multithermobag (6R)', 'Supreme Backpack',
        'Flash Backpack', 'Standard 6R Bag',
        'Standard 3R Bag', 'Standard Backpack'
      ]
    }
  ],
  shuttle: [
    {
      name: 'Yonex',
      logo: '/static/brands/yonex.svg',
      models: [
        'Aerosensa 50 (AS-50)', 'Aerosensa 40 (AS-40)',
        'Aerosensa 30 (AS-30)', 'Aerosensa 20 (AS-20)',
        'Aerosensa 10 (AS-10)',
        'Aeroclub TR', 'League 7', 'Crosswind',
        'Mavis 2000 (Nylon)', 'Mavis 370 (Nylon)', 'Mavis 200 (Nylon)'
      ]
    },
    {
      name: 'Li-Ning',
      logo: '/static/brands/lining.svg',
      models: [
        'A+900', 'A+700', 'A+620', 'A+600', 'A+300',
        'D80', 'D70', 'D60', 'D50',
        'GP Gold (Nylon)'
      ]
    },
    {
      name: 'Victor',
      logo: '/static/brands/victor.svg',
      models: [
        'Master Ace', 'Champion No.1', 'Champion No.3',
        'Gold No.1', 'Gold No.5', 'Silver No.3',
        'Flight Master (Nylon)', 'NS-2000 (Nylon)'
      ]
    }
  ]
}

// ── Model Images ──
// Maps model names to product images. Falls back to brand logo if missing.
const modelImages = {
  Yonex: {
    'Astrox 100ZZ': '/static/models/yonex/astrox-100zz.jpg',
    'Astrox 99 Pro': '/static/models/yonex/astrox-99-pro.jpg',
    'Nanoflare 1000Z': '/static/models/yonex/nanoflare-1000z.jpg',
    'Arcsaber 11 Pro': '/static/models/yonex/arcsaber-11-pro.jpg',
    'Astrox 88D Pro': '/static/models/yonex/astrox-88d-pro.jpg',
    'Astrox 88S Pro': '/static/models/yonex/astrox-88s-pro.jpg',
    'Astrox 77 Pro': '/static/models/yonex/astrox-77-pro.jpg',
    'Nanoflare 800 Pro': '/static/models/yonex/nanoflare-800-pro.jpg',
    'Nanoflare 700 Pro': '/static/models/yonex/nanoflare-700-pro.jpg',
    'Arcsaber 7 Pro': '/static/models/yonex/arcsaber-7-pro.jpg',
    'Power Cushion 65 Z3': '/static/models/yonex/pc-65z3.jpg',
    'Power Cushion Aerus Z2': '/static/models/yonex/pc-aerus-z2.jpg',
    'Power Cushion Eclipsion Z3': '/static/models/yonex/pc-eclipsion-z3.jpg',
    'Pro Racquet Bag (9R)': '/static/models/yonex/bag-pro-9r.jpg',
    'Aerosensa 50 (AS-50)': '/static/models/yonex/as-50.jpg',
    'Aerosensa 30 (AS-30)': '/static/models/yonex/as-30.jpg',
  },
  Victor: {
    'Auraspeed 90K Metallic': '/static/models/victor/auraspeed-90k-metallic.jpg',
    'Auraspeed 100X Ultra': '/static/models/victor/auraspeed-100x-ultra.jpg',
    'Thruster F C Ultra X': '/static/models/victor/thruster-fc-ultra-x.jpg',
    'Thruster Ryuga II Pro': '/static/models/victor/thruster-ryuga-ii-pro.jpg',
    'DriveX 10 Metallic': '/static/models/victor/drivex-10-metallic.jpg',
    'Jetspeed S 12 II': '/static/models/victor/jetspeed-s12-ii.jpg',
    'P9200 III': '/static/models/victor/p9200-iii.jpg',
    'P9200 TTY': '/static/models/victor/p9200-tty.jpg',
    'A970 Ace': '/static/models/victor/a970-ace.jpg',
    'S82 III': '/static/models/victor/s82-iii.jpg',
    'Champion No.1': '/static/models/victor/champion-no1.jpg',
    'Master Ace': '/static/models/victor/master-ace.jpg',
    'Supreme Multithermobag (9R)': '/static/models/victor/bag-supreme-9r.jpg',
  },
  'Li-Ning': {
    'Axforce 90 Max Tiger': '/static/models/lining/axforce-90-tiger.jpg',
    'Axforce 90 Max Dragon': '/static/models/lining/axforce-90-dragon.jpg',
    'Bladex 900 Max Sun': '/static/models/lining/bladex-900-sun.jpg',
    'Bladex 900 Max Moon': '/static/models/lining/bladex-900-moon.jpg',
    'Halbertec 9000': '/static/models/lining/halbertec-9000.jpg',
    'Axforce 100 II': '/static/models/lining/axforce-100-ii.jpg',
    'Saga Pro': '/static/models/lining/saga-pro.jpg',
    'Ranger TD': '/static/models/lining/ranger-td.jpg',
    'A+900': '/static/models/lining/a-plus-900.jpg',
  },
  Mizuno: {
    'Wave Fang Pro': '/static/models/mizuno/wave-fang-pro.jpg',
    'Wave Fang Zero 2': '/static/models/mizuno/wave-fang-zero-2.jpg',
    'Wave Claw Neo 3': '/static/models/mizuno/wave-claw-neo-3.jpg',
  },
  ASICS: {
    'Gel-Blade 8': '/static/models/asics/gel-blade-8.jpg',
    'Gel-Rocket 11': '/static/models/asics/gel-rocket-11.jpg',
    'Court Control FF 3': '/static/models/asics/court-control-ff-3.jpg',
  },
  Babolat: {
    'X-Feel Blast': '/static/models/babolat/x-feel-blast.jpg',
    'Satelite Blast': '/static/models/babolat/satelite-blast.jpg',
  },
  Carlton: {
    'Kinesis Ultra': '/static/models/carlton/kinesis-ultra.jpg',
    'Vapour Trail Pure': '/static/models/carlton/vapour-trail-pure.jpg',
  },
  'FZ Forza': {
    'Precision 12000 VS': '/static/models/forza/precision-12000-vs.jpg',
    'Power 999': '/static/models/forza/power-999.jpg',
  },
  Kawasaki: {
    'Honor S6': '/static/models/kawasaki/honor-s6.jpg',
    'King K9': '/static/models/kawasaki/king-k9.jpg',
  },
  Kason: {
    'Feather K600': '/static/models/kason/feather-k600.jpg',
  },
  Apacs: {
    'Fantala 6.0 Speed': '/static/models/apacs/fantala-60-speed.jpg',
    'Z Ziggler': '/static/models/apacs/z-ziggler.jpg',
  },
  'Fleet/Felet': {
    'Woven 1000 III': '/static/models/fleet/woven-1000-iii.jpg',
    'TJ Power': '/static/models/fleet/tj-power.jpg',
  },
}

export const equipmentData = brands

/**
 * Get brands list for a specific equipment type
 */
export function getBrandsByType(type) {
  const typeData = brands[type]
  if (!typeData) return []
  return typeData.map(b => ({ name: b.name, logo: b.logo }))
}

/**
 * Get models for a specific brand under a given type
 */
export function getModelsByBrand(type, brandName) {
  const typeData = brands[type]
  if (!typeData) return []
  const brand = typeData.find(b => b.name === brandName)
  if (!brand) return []
  return brand.models
}

/**
 * Get model image URL with fallback to brand logo
 */
export function getModelImageUrl(brandName, modelName) {
  const brandImages = modelImages[brandName]
  if (brandImages && brandImages[modelName]) {
    return brandImages[modelName]
  }
  return getBrandLogo(brandName)
}

/**
 * Get brand logo URL by brand name
 */
export function getBrandLogo(brandName) {
  for (const type of Object.keys(brands)) {
    const brand = brands[type].find(b => b.name === brandName)
    if (brand) return brand.logo
  }
  return null
}

export const EQUIP_TYPE_ICONS = {
  racket: '\ue622',
  shoes: '\ue6a0',
  bag: '\ue60a',
  shuttle: '\ue622',
  other: '其他'
}
