import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const IMG = (p) => 'data:image/jpeg;base64,' + readFileSync(p).toString('base64')
const sw = IMG('D:/GitHub/ElectroLead/public/img/categories/switchgear.jpg')
const hero = IMG('D:/GitHub/ElectroLead/public/img/scenes/hero.jpg')

// Four directions. Two keep the owner's orange (she likes it); two offer the
// colours the Indian electrical trade actually uses - Polycab, Havells,
// Finolex and KEI are all blue-led, and copper is the material itself.
const PALETTES = [
  {
    id: 'A',
    name: 'Current — Safety Orange on cream',
    note: 'What is live today',
    ink: '#2d2d2d', primary: '#f06400', surface: '#f0f0ec', panel: '#ffffff',
    accent: '#646e57', line: '#e3e3e0', muted: '#6b6b66', tileBg: '#2d2d2d',
  },
  {
    id: 'B',
    name: 'Grounded Orange on graphite',
    note: 'Same orange, industrial surfaces instead of cream',
    ink: '#14171A', primary: '#E85D04', surface: '#E8E6E1', panel: '#ffffff',
    accent: '#5A6B5D', line: '#CFCCC5', muted: '#5E6367', tileBg: '#1C2024',
  },
  {
    id: 'C',
    name: 'Utility Blue + Safety Amber',
    note: 'What the Indian electrical trade actually looks like',
    ink: '#101E2B', primary: '#0B4F8A', surface: '#EEF1F4', panel: '#ffffff',
    accent: '#F5A524', line: '#D3DAE1', muted: '#5B6B7A', tileBg: '#101E2B',
  },
  {
    id: 'D',
    name: 'Graphite + Copper',
    note: 'Copper is the material being traded',
    ink: '#201F1D', primary: '#B4551F', surface: '#F1EEE9', panel: '#ffffff',
    accent: '#7A8B99', line: '#DAD5CC', muted: '#6A655E', tileBg: '#201F1D',
  },
]

const slice = (p) => `
<section style="background:${p.surface};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:${p.ink}">
  <div style="border-bottom:1px solid ${p.line};padding:14px 34px;display:flex;align-items:center;justify-content:space-between">
    <strong style="font-size:15px;letter-spacing:-.01em">VoltSupply</strong>
    <div style="display:flex;gap:22px;align-items:center;font-size:12.5px;color:${p.muted}">
      <span>Categories</span><span>How it works</span><span>Pricing</span>
      <span style="color:${p.ink}">Sign In</span>
      <span style="background:${p.primary};color:#fff;padding:7px 15px;border-radius:6px;font-weight:600">Get Started</span>
    </div>
  </div>

  <div style="padding:30px 34px;display:grid;grid-template-columns:1.05fr .95fr;gap:30px;align-items:center">
    <div>
      <div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${p.accent};font-weight:700;margin-bottom:12px">B2B Electrical Supply · India</div>
      <h1 style="font-size:36px;line-height:1.08;letter-spacing:-.025em;margin:0 0 12px;font-weight:700">Post a requirement.<br>Get quotes from verified suppliers.</h1>
      <p style="font-size:14px;line-height:1.55;color:${p.muted};margin:0 0 18px;max-width:430px">Cable, switchgear, transformers and more — from suppliers near your site, with GST-verified credentials.</p>
      <div style="display:flex;gap:8px;max-width:440px">
        <div style="flex:1;background:#fff;border:1px solid ${p.line};border-radius:7px;padding:11px 14px;font-size:13px;color:#9a9a96">What do you need to source?</div>
        <div style="background:${p.primary};color:#fff;padding:11px 20px;border-radius:7px;font-size:13px;font-weight:600;white-space:nowrap">Post requirement →</div>
      </div>
    </div>
    <div style="position:relative">
      <img src="${hero}" style="width:100%;height:196px;object-fit:cover;border-radius:10px;display:block">
      <div style="position:absolute;left:14px;right:14px;bottom:-20px;background:#fff;border:1px solid ${p.line};border-radius:10px;display:grid;grid-template-columns:repeat(3,1fr);box-shadow:0 2px 10px rgba(0,0,0,.07)">
        ${[['24','Verified suppliers'],['20','Cities covered'],['26','Open requirements']].map(([v,l],i)=>`
          <div style="padding:11px 4px;text-align:center;${i?`border-left:1px solid ${p.line}`:''}">
            <div style="font-size:19px;font-weight:700;color:${p.primary}">${v}</div>
            <div style="font-size:9px;color:${p.muted};margin-top:1px">${l}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div style="background:${p.panel};padding:34px;border-top:1px solid ${p.line}">
    <h2 style="font-size:19px;margin:0 0 3px;letter-spacing:-.01em;font-weight:700">Browse by category</h2>
    <p style="font-size:12px;color:${p.muted};margin:0 0 15px">Every supplier is KYC-checked before they can quote.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px">
      ${[['Switchgear & Panels','photo'],['Wires & Cables','tile'],['Transformers','tile'],['LED & Lighting','tile']].map(([label,kind])=>`
        <div style="border:1px solid ${p.line};border-radius:9px;overflow:hidden;background:#fff">
          ${kind==='photo'
            ? `<img src="${sw}" style="width:100%;height:72px;object-fit:cover;display:block">`
            : `<div style="height:72px;background:${p.tileBg};display:flex;align-items:center;justify-content:center">
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${p.primary}" stroke-width="1.6"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>
               </div>`}
          <div style="padding:9px 10px">
            <div style="font-size:12px;font-weight:600">${label}</div>
            <div style="font-size:10px;color:${p.accent};margin-top:4px;font-weight:600">5 suppliers</div>
          </div>
        </div>`).join('')}
    </div>
  </div>

  <div style="padding:26px 34px 30px">
    <div style="display:flex;gap:11px">
      ${[['Raman Switchgear India','4.9','Chennai, Tamil Nadu'],['Bharat Cable Industries','4.7','Delhi, Delhi']].map(([n,r,c])=>`
        <div style="flex:1;background:#fff;border:1px solid ${p.line};border-radius:9px;padding:13px 14px">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
            <strong style="font-size:13px">${n}</strong>
            <span style="font-size:9px;font-weight:700;color:${p.accent};background:${p.accent}1f;padding:3px 7px;border-radius:99px;white-space:nowrap">✓ Verified</span>
          </div>
          <div style="font-size:11px;color:${p.muted};margin:7px 0 0">★ <strong style="color:${p.ink}">${r}</strong> · 27 yrs · ${c}</div>
        </div>`).join('')}
    </div>
  </div>
</section>`

const page = `<!doctype html><meta charset=utf-8>
<body style="margin:0;background:#8a8a8a;font-family:system-ui,sans-serif">
${PALETTES.map(p=>`
  <div style="padding:16px 16px 0">
    <div style="color:#fff;font-size:15px;font-weight:700;margin-bottom:7px">
      ${p.id} · ${p.name}
      <span style="font-weight:400;opacity:.8;font-size:12.5px"> — ${p.note}</span>
      <span style="float:right;font-family:ui-monospace,monospace;font-size:11px;opacity:.85">
        ${p.primary} &nbsp; ${p.ink} &nbsp; ${p.surface} &nbsp; ${p.accent}
      </span>
    </div>
    <div style="border-radius:10px;overflow:hidden">${slice(p)}</div>
  </div>`).join('')}
<div style="height:18px"></div></body>`

const b = await chromium.launch()
const pg = await (await b.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 })).newPage()
await pg.setContent(page)
await pg.waitForTimeout(2500)
await pg.screenshot({ path: 'palette-options.png', fullPage: true })
await b.close()
console.log('wrote palette-options.png')
