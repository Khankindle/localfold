import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
const q = await page.evaluate(()=>{
  const H = window.Heatmap || {};
  return {keys:Object.keys(H), mapTabsHTML: document.querySelector(".py2dmol-map-tabs")?.innerHTML.slice(0,600),
          config: window.viewerConfig?.heatmap};
});
console.log(JSON.stringify(q,null,1));
await browser.close();
