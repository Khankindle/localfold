import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("pageerror",e=>console.log("[e]",e.message));
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log("empty", await page.evaluate(()=>{
  const r=document.getElementById("objectRow");
  return JSON.stringify({cls:r.className, inline:r.getAttribute("style"), display:getComputedStyle(r).display,
    rect:[r.getBoundingClientRect().width,r.getBoundingClientRect().height], options:document.getElementById("objectSelect").options.length});
}));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,4500));
console.log("after ", await page.evaluate(()=>{
  const r=document.getElementById("objectRow");
  return JSON.stringify({cls:r.className, inline:r.getAttribute("style"), display:getComputedStyle(r).display,
    rect:[Math.round(r.getBoundingClientRect().width),Math.round(r.getBoundingClientRect().height)],
    options:document.getElementById("objectSelect").options.length, value:document.getElementById("objectSelect").value});
}));
await browser.close();
