import puppeteer from "puppeteer-core";

const exe = process.env.CHROME_BIN || "/tmp/chromium";
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
    "--window-size=1280,720",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
page.on("console", (m) => console.log("[console]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(process.argv[2] || "http://127.0.0.1:4173/index.html", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 4000));
const info = await page.evaluate(() => ({
  title: document.title,
  hasCanvas: !!document.querySelector("#canvas"),
  canvasSize: (() => { const c = document.querySelector("#canvas"); return c ? [c.width, c.height, c.clientWidth, c.clientHeight] : null; })(),
  containerDisplay: getComputedStyle(document.querySelector("#viewer-container")).display,
  viewers: Object.keys(window.py2dmol_viewers || {}),
}));
console.log(JSON.stringify(info, null, 2));
await browser.close();
