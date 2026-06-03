/* ============================================================
   Shared device database + reference objects.

   Data model: each device stores its LOGICAL (CSS) resolution
   (w × h, in CSS points), the physical screen diagonal in
   inches, and the devicePixelRatio. From those we derive:
     pxPerInch (CSS) = sqrt(w² + h²) / diagonalInches
   which is exactly what the ruler needs to draw real units, and
   stays correct even on downsampled panels (e.g. iPhone Plus).
   The physical marketing PPI = pxPerInch × dpr (shown for info).
   ============================================================ */

export interface DeviceEntry {
  w: number; // logical / CSS width
  h: number; // logical / CSS height
  dpr: number; // devicePixelRatio (used for auto-detection)
  ppi: number; // CSS pixels per inch (apply directly as pxPerInch)
  physPpi: number; // physical pixels per inch (marketing number)
  label: string;
  cat: string;
}

// [label, logicalW, logicalH, diagonalInches, dpr]
type Row = [string, number, number, number, number];

function build(cat: string, rows: Row[]): DeviceEntry[] {
  return rows.map(([label, w, h, diag, dpr]) => {
    const cssPpi = Math.sqrt(w * w + h * h) / diag;
    return {
      w,
      h,
      dpr,
      ppi: Math.round(cssPpi * 10) / 10,
      physPpi: Math.round(cssPpi * dpr),
      label,
      cat,
    };
  });
}

/* ---------------------------- Phones ---------------------------- */
const PHONES: Row[] = [
  // Apple iPhone
  ["Apple iPhone 16 Pro Max", 440, 956, 6.9, 3],
  ["Apple iPhone 16 Pro", 402, 874, 6.3, 3],
  ["Apple iPhone 16 Plus", 430, 932, 6.7, 3],
  ["Apple iPhone 16", 393, 852, 6.1, 3],
  ["Apple iPhone 16e", 390, 844, 6.1, 3],
  ["Apple iPhone 15 Pro Max", 430, 932, 6.7, 3],
  ["Apple iPhone 15 Pro", 393, 852, 6.1, 3],
  ["Apple iPhone 15 Plus", 430, 932, 6.7, 3],
  ["Apple iPhone 15", 393, 852, 6.1, 3],
  ["Apple iPhone 14 Pro Max", 430, 932, 6.7, 3],
  ["Apple iPhone 14 Pro", 393, 852, 6.1, 3],
  ["Apple iPhone 14 Plus", 428, 926, 6.7, 3],
  ["Apple iPhone 14", 390, 844, 6.1, 3],
  ["Apple iPhone 13 Pro Max", 428, 926, 6.7, 3],
  ["Apple iPhone 13 Pro", 390, 844, 6.1, 3],
  ["Apple iPhone 13", 390, 844, 6.1, 3],
  ["Apple iPhone 13 mini", 375, 812, 5.4, 3],
  ["Apple iPhone 12 Pro Max", 428, 926, 6.7, 3],
  ["Apple iPhone 12 Pro", 390, 844, 6.1, 3],
  ["Apple iPhone 12", 390, 844, 6.1, 3],
  ["Apple iPhone 12 mini", 375, 812, 5.4, 3],
  ["Apple iPhone 11 Pro Max", 414, 896, 6.5, 3],
  ["Apple iPhone 11 Pro", 375, 812, 5.8, 3],
  ["Apple iPhone 11", 414, 896, 6.1, 2],
  ["Apple iPhone XS Max", 414, 896, 6.5, 3],
  ["Apple iPhone XS", 375, 812, 5.8, 3],
  ["Apple iPhone XR", 414, 896, 6.1, 2],
  ["Apple iPhone X", 375, 812, 5.8, 3],
  ["Apple iPhone SE (3rd/2nd gen)", 375, 667, 4.7, 2],
  ["Apple iPhone 8 Plus", 414, 736, 5.5, 3],
  ["Apple iPhone 8", 375, 667, 4.7, 2],
  ["Apple iPhone 7 Plus", 414, 736, 5.5, 3],
  ["Apple iPhone 7", 375, 667, 4.7, 2],
  ["Apple iPhone 6s Plus", 414, 736, 5.5, 3],
  ["Apple iPhone 6s", 375, 667, 4.7, 2],
  ["Apple iPhone SE (1st gen)", 320, 568, 4.0, 2],
  ["Apple iPhone 5s / 5c / 5", 320, 568, 4.0, 2],
  ["Apple iPhone 4s / 4", 320, 480, 3.5, 2],

  // Samsung Galaxy S
  ["Samsung Galaxy S24 Ultra", 384, 832, 6.8, 3.75],
  ["Samsung Galaxy S24+", 384, 832, 6.7, 3],
  ["Samsung Galaxy S24", 360, 780, 6.2, 3],
  ["Samsung Galaxy S23 Ultra", 384, 824, 6.8, 3.75],
  ["Samsung Galaxy S23+", 384, 832, 6.6, 3],
  ["Samsung Galaxy S23", 360, 780, 6.1, 3],
  ["Samsung Galaxy S22 Ultra", 384, 824, 6.8, 3.75],
  ["Samsung Galaxy S22+", 384, 832, 6.6, 3],
  ["Samsung Galaxy S22", 360, 780, 6.1, 3],
  ["Samsung Galaxy S21 Ultra", 384, 854, 6.8, 3.75],
  ["Samsung Galaxy S21+", 384, 854, 6.7, 3],
  ["Samsung Galaxy S21", 360, 800, 6.2, 3],
  ["Samsung Galaxy S20 Ultra", 384, 854, 6.9, 3.5],
  ["Samsung Galaxy S20+", 384, 854, 6.7, 3.5],
  ["Samsung Galaxy S20", 360, 800, 6.2, 4],
  ["Samsung Galaxy S10+", 360, 760, 6.4, 4],
  ["Samsung Galaxy S10", 360, 760, 6.1, 4],
  ["Samsung Galaxy S10e", 360, 760, 5.8, 3],
  ["Samsung Galaxy S9+", 360, 740, 6.2, 4],
  ["Samsung Galaxy S9", 360, 740, 5.8, 4],
  ["Samsung Galaxy S8+", 360, 740, 6.2, 4],
  ["Samsung Galaxy S8", 360, 740, 5.8, 4],

  // Samsung Galaxy Note / Z
  ["Samsung Galaxy Note 20 Ultra", 384, 854, 6.9, 3.75],
  ["Samsung Galaxy Note 20", 384, 854, 6.7, 2.625],
  ["Samsung Galaxy Note 10+", 412, 869, 6.8, 3.5],
  ["Samsung Galaxy Note 10", 360, 760, 6.3, 3.5],
  ["Samsung Galaxy Z Fold 6 (cover)", 376, 968, 6.3, 2.625],
  ["Samsung Galaxy Z Fold 5 (main)", 768, 884, 7.6, 2.0],
  ["Samsung Galaxy Z Flip 6", 360, 748, 6.7, 3],
  ["Samsung Galaxy Z Flip 5", 360, 748, 6.7, 3],

  // Samsung Galaxy A / M
  ["Samsung Galaxy A55 / A54", 360, 800, 6.4, 3],
  ["Samsung Galaxy A35 / A34", 360, 800, 6.6, 3],
  ["Samsung Galaxy A15", 360, 800, 6.5, 3],
  ["Samsung Galaxy A14", 360, 800, 6.6, 3],
  ["Samsung Galaxy A53", 360, 800, 6.5, 3],
  ["Samsung Galaxy M14 / M34", 360, 800, 6.6, 3],

  // Google Pixel
  ["Google Pixel 9 Pro XL", 412, 915, 6.8, 3],
  ["Google Pixel 9 Pro", 384, 856, 6.3, 3],
  ["Google Pixel 9", 384, 856, 6.3, 3],
  ["Google Pixel 8 Pro", 412, 915, 6.7, 3],
  ["Google Pixel 8", 412, 915, 6.2, 2.625],
  ["Google Pixel 8a", 412, 915, 6.1, 2.625],
  ["Google Pixel 7 Pro", 412, 892, 6.7, 3.5],
  ["Google Pixel 7", 412, 915, 6.3, 2.625],
  ["Google Pixel 7a", 412, 915, 6.1, 2.625],
  ["Google Pixel 6 Pro", 412, 892, 6.7, 3.5],
  ["Google Pixel 6", 412, 915, 6.4, 2.625],
  ["Google Pixel 6a", 412, 915, 6.1, 2.625],
  ["Google Pixel 5", 393, 851, 6.0, 2.75],
  ["Google Pixel 4a / 4", 393, 830, 5.7, 2.75],
  ["Google Pixel 3", 393, 786, 5.5, 2.75],

  // OnePlus
  ["OnePlus 12", 412, 919, 6.82, 3.5],
  ["OnePlus 11", 412, 919, 6.7, 3.5],
  ["OnePlus 10 Pro", 412, 919, 6.7, 3.5],
  ["OnePlus 9 Pro", 412, 919, 6.7, 3.5],
  ["OnePlus 9", 360, 804, 6.55, 3.5],
  ["OnePlus Nord 3 / Nord 2", 412, 915, 6.7, 2.625],
  ["OnePlus 8 Pro", 412, 919, 6.78, 3.5],
  ["OnePlus 7 Pro", 412, 892, 6.67, 3.5],

  // Xiaomi / Redmi / Poco
  ["Xiaomi 14 Pro", 360, 800, 6.73, 3.75],
  ["Xiaomi 14", 360, 800, 6.36, 3.75],
  ["Xiaomi 13 Pro", 360, 800, 6.73, 3.75],
  ["Xiaomi 13", 360, 800, 6.36, 3.75],
  ["Xiaomi 12", 360, 800, 6.28, 3.75],
  ["Redmi Note 13 Pro", 393, 873, 6.67, 2.75],
  ["Redmi Note 12 Pro", 393, 873, 6.67, 2.75],
  ["Redmi Note 11", 393, 873, 6.43, 2.75],
  ["Poco F5 / F4", 393, 873, 6.67, 2.75],
  ["Poco X5 / X4", 393, 873, 6.67, 2.75],

  // Oppo / Vivo / Realme / Honor / Nothing
  ["Oppo Find X7 Ultra", 384, 854, 6.82, 3.5],
  ["Oppo Find X6", 384, 854, 6.74, 3.5],
  ["Oppo Reno 11 / Reno 10", 360, 804, 6.7, 3],
  ["Vivo X100 Pro", 384, 854, 6.78, 3.5],
  ["Vivo V29 / V27", 360, 804, 6.78, 3],
  ["Realme 12 Pro", 360, 800, 6.7, 3],
  ["Realme GT 5", 360, 800, 6.74, 3],
  ["Honor Magic 6 Pro", 384, 854, 6.8, 3.5],
  ["Honor 90", 384, 854, 6.7, 3],
  ["Nothing Phone (2)", 412, 919, 6.7, 2.625],
  ["Nothing Phone (1)", 412, 919, 6.55, 2.625],

  // Motorola / Sony / Asus / Nokia
  ["Motorola Edge 40 Pro", 412, 919, 6.67, 2.625],
  ["Motorola Moto G (2023)", 412, 915, 6.5, 2.625],
  ["Sony Xperia 1 V", 384, 916, 6.5, 3.5],
  ["Sony Xperia 5 V", 360, 804, 6.1, 3],
  ["Asus ROG Phone 8", 412, 915, 6.78, 2.625],
  ["Asus Zenfone 10", 360, 800, 5.9, 3],
  ["Nokia G42 / G22", 360, 800, 6.56, 3],
];

/* ---------------------------- Tablets ---------------------------- */
const TABLETS: Row[] = [
  ["Apple iPad Pro 13\" (M4)", 1032, 1376, 13.0, 2],
  ["Apple iPad Pro 12.9\"", 1024, 1366, 12.9, 2],
  ["Apple iPad Pro 11\" (M4)", 834, 1210, 11.1, 2],
  ["Apple iPad Pro 11\"", 834, 1194, 11.0, 2],
  ["Apple iPad Air 13\" (M2)", 1024, 1366, 12.9, 2],
  ["Apple iPad Air 11\" / 10.9\"", 820, 1180, 10.9, 2],
  ["Apple iPad 10th gen", 820, 1180, 10.9, 2],
  ["Apple iPad 9th / 8th / 7th gen", 810, 1080, 10.2, 2],
  ["Apple iPad mini (6th gen)", 744, 1133, 8.3, 2],
  ["Apple iPad mini (5th gen)", 768, 1024, 7.9, 2],
  ["Apple iPad (9.7\" classic)", 768, 1024, 9.7, 2],
  ["Samsung Galaxy Tab S9 Ultra", 478, 765, 14.6, 2],
  ["Samsung Galaxy Tab S9+", 451, 722, 12.4, 2],
  ["Samsung Galaxy Tab S9", 415, 665, 11.0, 2],
  ["Samsung Galaxy Tab S8", 415, 665, 11.0, 2],
  ["Samsung Galaxy Tab S7", 415, 665, 11.0, 2],
  ["Samsung Galaxy Tab A9+", 432, 690, 11.0, 2],
  ["Samsung Galaxy Tab A8", 400, 640, 10.5, 2],
  ["Google Pixel Tablet", 540, 861, 10.95, 2],
  ["Microsoft Surface Pro 9", 712, 1067, 13.0, 2],
  ["Microsoft Surface Pro 7/8", 684, 1026, 12.3, 2],
  ["Microsoft Surface Go", 540, 720, 10.5, 2],
  ["Amazon Fire HD 10", 600, 960, 10.1, 1.7916667],
  ["Amazon Fire HD 8", 500, 800, 8.0, 1.6],
  ["Lenovo Tab P12", 480, 768, 12.7, 2.5],
  ["Lenovo Tab M10", 400, 640, 10.6, 2],
  ["Xiaomi Pad 6", 482, 771, 11.0, 2.25],
  ["OnePlus Pad", 487, 651, 11.61, 2.4],
  ["Huawei MatePad 11", 480, 768, 11.0, 2.5],
];

/* ---------------------------- Laptops ---------------------------- */
const LAPTOPS: Row[] = [
  ["MacBook Air 13\" (M2/M3)", 1470, 956, 13.6, 2],
  ["MacBook Air 15\" (M2/M3)", 1710, 1112, 15.3, 2],
  ["MacBook Air 13\" (M1/Retina)", 1280, 800, 13.3, 2],
  ["MacBook Pro 14\" (M-series)", 1512, 982, 14.2, 2],
  ["MacBook Pro 16\" (M-series)", 1728, 1117, 16.2, 2],
  ["MacBook Pro 13\" (Retina)", 1280, 800, 13.3, 2],
  ["MacBook Pro 15\" (Retina)", 1440, 900, 15.4, 2],
  ["MacBook (12\" Retina)", 1280, 800, 12.0, 2],
  ["Dell XPS 13", 1920, 1200, 13.4, 1.5],
  ["Dell XPS 15", 1920, 1200, 15.6, 1.5],
  ["Dell XPS 17", 1920, 1200, 17.0, 1.5],
  ["Dell Latitude 14", 1920, 1080, 14.0, 1],
  ["HP Spectre x360 14", 1920, 1280, 13.5, 1.5],
  ["HP Envy 15", 1920, 1080, 15.6, 1],
  ["HP Pavilion 14", 1920, 1080, 14.0, 1],
  ["Lenovo ThinkPad X1 Carbon", 1920, 1200, 14.0, 1.5],
  ["Lenovo Yoga 9i", 1920, 1200, 14.0, 1.5],
  ["Lenovo Legion 5 (15.6\")", 1920, 1080, 15.6, 1],
  ["Asus Zenbook 14 OLED", 1920, 1200, 14.0, 1.5],
  ["Asus ROG Zephyrus G14", 1920, 1200, 14.0, 1.5],
  ["Microsoft Surface Laptop 13.5\"", 1504, 1000, 13.5, 2],
  ["Microsoft Surface Laptop 15\"", 1664, 1080, 15.0, 2],
  ["Framework Laptop 13", 1504, 1004, 13.5, 2],
  ["Acer Aspire 15.6\"", 1920, 1080, 15.6, 1],
  ["Generic laptop 13.3\" (1080p)", 1920, 1080, 13.3, 1],
  ["Generic laptop 14\" (1080p)", 1920, 1080, 14.0, 1],
  ["Generic laptop 15.6\" (1080p)", 1920, 1080, 15.6, 1],
  ["Generic laptop 15.6\" (768p)", 1366, 768, 15.6, 1],
  ["Generic laptop 17.3\" (1080p)", 1920, 1080, 17.3, 1],
];

/* ---------------------------- Monitors ---------------------------- */
const MONITORS: Row[] = [
  ["Apple Studio Display 27\"", 2560, 1440, 27.0, 2],
  ["Apple Pro Display XDR 32\"", 3008, 1692, 32.0, 2],
  ["Apple iMac 24\" (4.5K)", 2240, 1260, 23.5, 2],
  ["Apple iMac 27\" (5K)", 2560, 1440, 27.0, 2],
  ["Monitor 21.5\" (1080p)", 1920, 1080, 21.5, 1],
  ["Monitor 22\" (1080p)", 1920, 1080, 22.0, 1],
  ["Monitor 23.8\" (1080p)", 1920, 1080, 23.8, 1],
  ["Monitor 24\" (1080p)", 1920, 1080, 24.0, 1],
  ["Monitor 24\" (1440p)", 2560, 1440, 24.0, 1],
  ["Monitor 27\" (1080p)", 1920, 1080, 27.0, 1],
  ["Monitor 27\" (1440p)", 2560, 1440, 27.0, 1],
  ["Monitor 27\" (4K)", 3840, 2160, 27.0, 1],
  ["Monitor 28\" (4K)", 3840, 2160, 28.0, 1],
  ["Monitor 31.5\" (1440p)", 2560, 1440, 31.5, 1],
  ["Monitor 32\" (4K)", 3840, 2160, 32.0, 1],
  ["Monitor 34\" Ultrawide (1440p)", 3440, 1440, 34.0, 1],
  ["Monitor 38\" Ultrawide (1600p)", 3840, 1600, 38.0, 1],
  ["Monitor 49\" Super Ultrawide", 5120, 1440, 49.0, 1],
  ["Monitor 42\" 4K", 3840, 2160, 42.0, 1],
  ["Monitor 16\" Portable (1080p)", 1920, 1080, 15.6, 1],
];

/* ---------------------------- Watches ---------------------------- */
const WATCHES: Row[] = [
  ["Apple Watch Ultra (49mm)", 205, 251, 1.93, 2],
  ["Apple Watch Series 9/8/7 (45mm)", 198, 242, 1.9, 2],
  ["Apple Watch Series 9/8/7 (41mm)", 176, 215, 1.69, 2],
  ["Apple Watch SE (44mm)", 184, 224, 1.78, 2],
  ["Apple Watch SE (40mm)", 162, 197, 1.57, 2],
  ["Samsung Galaxy Watch 6 (44mm)", 240, 240, 1.47, 2],
  ["Samsung Galaxy Watch 6 (40mm)", 216, 216, 1.31, 2],
];

/* ---------------------------- Handhelds ---------------------------- */
const HANDHELDS: Row[] = [
  ["Valve Steam Deck / OLED", 1280, 800, 7.4, 1],
  ["Nintendo Switch (handheld)", 1280, 720, 6.2, 1],
  ["Nintendo Switch OLED", 1280, 720, 7.0, 1],
  ["Asus ROG Ally", 1920, 1080, 7.0, 1],
  ["Lenovo Legion Go", 2560, 1600, 8.8, 1],
  ["Steam Deck LCD", 1280, 800, 7.0, 1],
];

/* ---------------------------- TVs ---------------------------- */
const TVS: Row[] = [
  ["TV 32\" (1080p)", 1920, 1080, 32.0, 1],
  ["TV 43\" (4K)", 3840, 2160, 43.0, 1],
  ["TV 50\" (4K)", 3840, 2160, 50.0, 1],
  ["TV 55\" (4K)", 3840, 2160, 55.0, 1],
  ["TV 65\" (4K)", 3840, 2160, 65.0, 1],
  ["TV 75\" (4K)", 3840, 2160, 75.0, 1],
  ["TV 65\" (8K)", 7680, 4320, 65.0, 1],
];

export const DEVICE_DB: DeviceEntry[] = [
  ...build("Phones", PHONES),
  ...build("Tablets", TABLETS),
  ...build("Laptops", LAPTOPS),
  ...build("Monitors", MONITORS),
  ...build("Watches", WATCHES),
  ...build("Handhelds", HANDHELDS),
  ...build("TVs", TVS),
];

export const DEVICE_COUNT = DEVICE_DB.length;

export interface RefObject {
  id: string;
  name: string;
  shape: "rect" | "circle";
  w?: number;
  h?: number;
  d?: number;
}

export const OBJECTS: RefObject[] = [
  // Cards & paper
  { id: "card", name: "Credit card (85.6 × 54 mm)", shape: "rect", w: 85.6, h: 53.98 },
  { id: "business", name: "Business card (89 × 51 mm)", shape: "rect", w: 88.9, h: 50.8 },
  { id: "sim", name: "SIM card (25 × 15 mm)", shape: "rect", w: 25, h: 15 },
  { id: "sdcard", name: "SD card (32 × 24 mm)", shape: "rect", w: 32, h: 24 },
  { id: "microsd", name: "microSD card (15 × 11 mm)", shape: "rect", w: 15, h: 11 },
  { id: "a4", name: "A4 paper (210 × 297 mm)", shape: "rect", w: 210, h: 297 },
  { id: "a5", name: "A5 paper (148 × 210 mm)", shape: "rect", w: 148, h: 210 },
  { id: "a6", name: "A6 paper (105 × 148 mm)", shape: "rect", w: 105, h: 148 },
  { id: "letter", name: "US Letter (216 × 279 mm)", shape: "rect", w: 215.9, h: 279.4 },
  { id: "legal", name: "US Legal (216 × 356 mm)", shape: "rect", w: 215.9, h: 355.6 },
  { id: "postcard", name: "Postcard (102 × 152 mm)", shape: "rect", w: 101.6, h: 152.4 },
  { id: "stamp", name: "Postage stamp (22 × 25 mm)", shape: "rect", w: 22, h: 25 },
  { id: "photo4x6", name: 'Photo 4×6" (102 × 152 mm)', shape: "rect", w: 101.6, h: 152.4 },
  // Coins
  { id: "quarter", name: "US quarter (Ø 24.26 mm)", shape: "circle", d: 24.26 },
  { id: "dime", name: "US dime (Ø 17.91 mm)", shape: "circle", d: 17.91 },
  { id: "nickel", name: "US nickel (Ø 21.21 mm)", shape: "circle", d: 21.21 },
  { id: "uspenny", name: "US penny (Ø 19.05 mm)", shape: "circle", d: 19.05 },
  { id: "euro1", name: "1 € coin (Ø 23.25 mm)", shape: "circle", d: 23.25 },
  { id: "euro2", name: "2 € coin (Ø 25.75 mm)", shape: "circle", d: 25.75 },
  { id: "penny", name: "UK penny (Ø 20.3 mm)", shape: "circle", d: 20.3 },
  { id: "pound1", name: "UK £1 coin (Ø 23.43 mm)", shape: "circle", d: 23.43 },
  // Everyday objects
  { id: "aa", name: "AA battery (50 × 14 mm)", shape: "rect", w: 14.5, h: 50.5 },
  { id: "aaa", name: "AAA battery (44 × 10 mm)", shape: "rect", w: 10.5, h: 44.5 },
  { id: "cd", name: "CD / DVD (Ø 120 mm)", shape: "circle", d: 120 },
  { id: "golf", name: "Golf ball (Ø 42.7 mm)", shape: "circle", d: 42.7 },
  { id: "tennis", name: "Tennis ball (Ø 67 mm)", shape: "circle", d: 67 },
  { id: "pingpong", name: "Ping-pong ball (Ø 40 mm)", shape: "circle", d: 40 },
  { id: "soda", name: "Soda can (66 × 115 mm)", shape: "rect", w: 66, h: 115 },
  { id: "usbA", name: "USB-A plug (12 × 4.5 mm)", shape: "rect", w: 12, h: 4.5 },
];

/* CSS pixels-per-inch to apply for a given device index. */
export function ppiForIndex(index: number): number | null {
  const d = DEVICE_DB[index];
  return d ? d.ppi : null;
}

export function detectDevice(): { index: number; pxPerInch: number; label: string } | null {
  const dpr = window.devicePixelRatio || 1;
  const sw = window.screen.width;
  const sh = window.screen.height;
  let best: { index: number; pxPerInch: number; label: string } | null = null;
  DEVICE_DB.forEach((d, index) => {
    const dprMatch = Math.abs(dpr - d.dpr) < 0.12;
    const dimMatch = (sw === d.w && sh === d.h) || (sw === d.h && sh === d.w);
    if (dprMatch && dimMatch && !best) best = { index, pxPerInch: d.ppi, label: d.label };
  });
  return best;
}

export function devicePresetsGrouped(): { cat: string; items: { index: number; label: string }[] }[] {
  const groups: { cat: string; items: { index: number; label: string }[] }[] = [];
  DEVICE_DB.forEach((d, index) => {
    let g = groups.find((x) => x.cat === d.cat);
    if (!g) {
      g = { cat: d.cat, items: [] };
      groups.push(g);
    }
    g.items.push({ index, label: d.label });
  });
  return groups;
}

/* Filter for the searchable picker. Returns grouped matches. */
export function searchDevices(query: string): { cat: string; items: { index: number; label: string }[] }[] {
  const q = query.trim().toLowerCase();
  const groups = devicePresetsGrouped();
  if (!q) return groups;
  const tokens = q.split(/\s+/);
  return groups
    .map((g) => ({
      cat: g.cat,
      items: g.items.filter((it) => {
        const hay = (it.label + " " + g.cat).toLowerCase();
        return tokens.every((tk) => hay.includes(tk));
      }),
    }))
    .filter((g) => g.items.length > 0);
}

export function fromDiagonal(diagonalInches: number): number {
  const sw = window.screen.width;
  const sh = window.screen.height;
  return Math.sqrt(sw * sw + sh * sh) / diagonalInches;
}
