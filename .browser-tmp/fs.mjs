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
  return {scrollY:window.scrollY, fs:!!document.fullscreenElement,
    canvas:[c.width,c.height], canvasRect:[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)],
    toolbarPos:getComputedStyle(t).position, toolbarRect:[Math.round(t.getBoundingClientRect().x),Math.round(t.getBoundingClientRect().y),Math.round(t.getBoundingClientRect().width),Math.round(t.getBoundingClientRect().height)],
    heading:getComputedStyle(document.querySelector(".viewer-heading")).display,
    hasStructure:document.querySelector("#canvasContainer").classList.contains("has-structure")};
});
console.log("before", JSON.stringify(await snap()));
await page.click("#fullscreenButton");
await new Promise(r=>setTimeout(r,900));
console.log("in    ", JSON.stringify(await snap()));
await page.keyboard.press("Escape");
await new Promise(r=>setTimeout(r,900));
console.log("after ", JSON.stringify(await snap()));
await browser.close();
