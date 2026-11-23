import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
for (const [w,h] of [[1280,720],[1100,720],[1000,720],[900,720],[768,1024],[414,896]]) {
  const page = await browser.newPage();
  await page.setViewport({width:w,height:h});
  await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2200));
  const out = await page.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    const bad=[];
    for(const el of document.querySelectorAll("body *")){
      const r=el.getBoundingClientRect();
      if(r.width===0||r.height===0) continue;
      if(r.right>vw+0.5||r.left<-0.5){
        bad.push([el.id||el.className||el.tagName, Math.round(r.left), Math.round(r.right)]);
      }
    }
    return {sw:document.documentElement.scrollWidth, cw:vw, scrollY:window.scrollY, docH:document.documentElement.scrollHeight,
            bad:bad.slice(0,8)};
  });
  console.log(w+"x"+h, JSON.stringify(out));
  await page.close();
}
await browser.close();
