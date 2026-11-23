import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,6000));
const q = await page.evaluate(()=>{
  const cc=document.querySelector("#canvasContainer");
  return {hasStructure:cc.classList.contains("has-structure"),
    afterDisplay:getComputedStyle(cc,"::after").display,
    afterBg:getComputedStyle(cc,"::after").backgroundColor,
    canvasRect:[cc.getBoundingClientRect().width|0,cc.getBoundingClientRect().height|0],
    controls:getComputedStyle(document.querySelector("#controlsContainer")).display,
    rpanel:[document.querySelector("#rightPanelContainer").getBoundingClientRect().height|0],
    objectRow:getComputedStyle(document.querySelector("#objectRow")).display};
});
console.log(JSON.stringify(q,null,1));
await browser.close();
