import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("pageerror",e=>console.log("[e]",e.message));
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,5000));
const snap = () => page.evaluate(()=>{
  const c=document.querySelector("#canvas"), t=document.querySelector("#viewer-toolbar");
  return {scrollY:window.scrollY, fs:!!document.fullscreenElement, canvas:[c.width,c.height],
    toolbarPos:getComputedStyle(t).position, pressed:document.querySelector("#fullscreenButton").getAttribute("aria-pressed"),
    label:document.querySelector("#fullscreenButton .tool-label")?.textContent};
});
console.log("before", JSON.stringify(await snap()));
await page.click("#fullscreenButton");
await new Promise(r=>setTimeout(r,800));
console.log("in    ", JSON.stringify(await snap()));
await page.evaluate(()=>document.exitFullscreen());
await new Promise(r=>setTimeout(r,900));
console.log("after ", JSON.stringify(await snap()));
await browser.close();
