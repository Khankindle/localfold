import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const execPath = await chromium.executablePath();
console.log("exec:", execPath);
const browser = await puppeteer.launch({
  args: [...chromium.args, "--enable-unsafe-webgpu", "--use-angle=swiftshader", "--enable-features=Vulkan", "--no-sandbox"],
  executablePath: execPath,
  headless: true,
  defaultViewport: { width: 1366, height: 768 },
});
const page = await browser.newPage();
page.on("console", (m) => console.log("[console]", m.type(), m.text().slice(0, 300)));
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 500)));
await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 8000));
const info = await page.evaluate(() => ({
  title: document.title,
  canvas: (() => { const c = document.getElementById("canvas"); return c ? { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight } : null; })(),
  viewerDisplay: getComputedStyle(document.getElementById("viewer-container")).display,
  predictDisabled: document.getElementById("predict").disabled,
  status: document.getElementById("status-message")?.textContent,
  webgpu: !!navigator.gpu,
}));
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: "/home/user/localfold/.browser-tmp/shot-initial.png" });
await browser.close();
