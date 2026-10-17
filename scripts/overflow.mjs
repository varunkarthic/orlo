// Lists elements wider than the viewport: node scripts/overflow.mjs <path> [width]
import { chromium } from "@playwright/test";
const [path = "", w = "320"] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 700 } });
await p.goto("http://localhost:4321/en/latest/" + path, { waitUntil: "networkidle" }); await p.waitForTimeout(500);
console.log(await p.evaluate(() => { const vw = document.documentElement.clientWidth; return [...document.querySelectorAll("body *")].filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed"; }).filter((el) => ![...el.children].some((c) => c.getBoundingClientRect().right > vw + 1)).slice(0, 12).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} right=${Math.round(el.getBoundingClientRect().right)}`); }));
await b.close();
