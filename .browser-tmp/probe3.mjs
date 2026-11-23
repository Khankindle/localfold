import puppeteer from "puppeteer-core";

const exe = "/tmp/chromium";
const url = process.argv[2] || "http://127.0.0.1:4173/index.html";
const shot = process.argv[3] || "";
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
         "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
const vp = JSON.parse(process.env.VP || '{"width":1280,"height":720}');
await page.setViewport(vp);
page.on("console", (m) => { if (process.env.VERBOSE) console.log("[console]", m.type(), m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, Number(process.env.WAIT || 3500)));

if (process.env.PDB) {
  const input = await page.$("#file-upload");
  await input.uploadFile(process.env.PDB);
  await new Promise((r) => setTimeout(r, Number(process.env.WAIT2 || 5000)));
}

const ids = (process.env.IDS || [
  "#viewer-container", "#mainContainer", "#viewerColumn", "#canvasContainer",
  "#canvas", "#controlsContainer", "#rightPanelsContainer", "#rightPanelContainer",
  "#navigationControls", "#heatmapContainer", "#plddtContainer",
  "#predictionScoresBox", "#downloads", "#sequence-viewer-container",
  "#status-row", "#fold-panel", "#objectRow", "#styleAppearanceContainer",
]).join(",");

const info = await page.evaluate((sel) => {
  const out = {};
  for (const s of sel.split(",")) {
    const el = document.querySelector(s);
    if (!el) { out[s] = null; continue; }
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out[s] = {
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      display: cs.display, overflow: cs.overflow, position: cs.position,
      scrollW: el.scrollWidth, scrollH: el.scrollHeight,
    };
  }
  out.__scrollY = window.scrollY;
  out.__docH = document.documentElement.scrollHeight;
  out.__bodyOverflow = getComputedStyle(document.body).overflow;
  const c = document.querySelector("#canvas");
  if (c) {
    out.__canvasBacking = [c.width, c.height];
    out.__viewportProvisional = !!c.__viewportProvisional;
    try {
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      out.__gl = !!gl;
    } catch { out.__gl = false; }
  }
  return out;
}, ids);
console.log(JSON.stringify(info, null, 1));

// Is the canvas flat (all one colour)?
if (process.env.PIXELS && info["#canvas"]) {
  const flat = await page.evaluate(() => {
    const c = document.querySelector("#canvas");
    const off = document.createElement("canvas");
    off.width = c.width; off.height = c.height;
    const ctx = off.getContext("2d");
    ctx.drawImage(c, 0, 0);
    const d = ctx.getImageData(0, 0, off.width, off.height).data;
    const seen = new Set();
    let opaque = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 8) { opaque++; seen.add(`${d[i]},${d[i + 1]},${d[i + 2]}`); }
      if (seen.size > 64) break;
    }
    return { distinct: seen.size, opaque };
  });
  console.log("PIXELS", JSON.stringify(flat));
}

if (shot) {
  await page.screenshot({ path: shot, fullPage: false });
  console.log("shot ->", shot);
}
await browser.close();
