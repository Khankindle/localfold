import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log(await page.evaluate(()=>{
  const r=(window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer;
  const c=document.querySelector("#canvas");
  return JSON.stringify({same:r?.canvas===c, rendererBg:r?.backgroundColor, inline:c?.style.background,
    attr:c?.getAttribute("style"), config:window.viewerConfig?.display?.background},null,1);
}));
await page.click("#theme-toggle");
await new Promise(r=>setTimeout(r,800));
console.log(await page.evaluate(()=>{
  const r=(window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer;
  const c=document.querySelector("#canvas");
  return JSON.stringify({rendererBg:r?.backgroundColor, inline:c?.style.background, attr:c?.getAttribute("style")},null,1);
}));
await browser.close();
