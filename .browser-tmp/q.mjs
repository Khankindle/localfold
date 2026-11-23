import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
const q = await page.evaluate(()=>{
  const r=(window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer;
  const c=document.querySelector("#canvas");
  return {bg:r?.backgroundColor, canvasInlineBg:c?.style.background, canvasCssBg:getComputedStyle(c).backgroundColor,
          display:window.viewerConfig?.display, canvasContainerBg:getComputedStyle(document.querySelector("#canvasContainer")).backgroundColor,
          containerAfter:getComputedStyle(document.querySelector("#canvasContainer"),"::after").backgroundColor};
});
console.log(JSON.stringify(q,null,1));
await browser.close();
