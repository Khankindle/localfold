import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
for (const [w,h] of [[1280,720],[1366,768],[1920,1080]]) {
  const page = await browser.newPage();
  await page.setViewport({width:w,height:h});
  await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2500));
  const out = await page.evaluate(()=>{
    const before=window.scrollY;
    window.scrollTo(0,600);
    const after=window.scrollY;
    const over=[];
    for(const el of document.querySelectorAll(".page-width, .app-rail, #status-col, #viewer-container, #sequence-viewer-container, #msa-buttons, footer")){
      const r=el.getBoundingClientRect();
      if(r.bottom>window.innerHeight+1) over.push([el.id||el.className, Math.round(r.top), Math.round(r.bottom)]);
    }
    return {before, after, maxScroll: document.documentElement.scrollHeight - window.innerHeight, over};
  });
  console.log(w+"x"+h, JSON.stringify(out));
  await page.close();
}
await browser.close();
