import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log(await page.evaluate(()=>{
  const sheets=[...document.styleSheets].map(s=>{try{return [s.href, s.cssRules.length]}catch(e){return [s.href,"ERR"]}});
  return JSON.stringify(sheets);
}));
await browser.close();
