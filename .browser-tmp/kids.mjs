import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log(await page.evaluate(()=>JSON.stringify([...document.body.children].map(e=>{
  const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
  return [e.tagName,e.id||e.className,Math.round(r.top),Math.round(r.height),cs.position,cs.display];
}),null,1)));
await browser.close();
