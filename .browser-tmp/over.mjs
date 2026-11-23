import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log(await page.evaluate(()=>{
  const out=[];
  for(const el of document.querySelectorAll("body *")){
    const r=el.getBoundingClientRect();
    if(r.height>0 && r.bottom>window.innerHeight+1){
      out.push([el.id||el.className||el.tagName, Math.round(r.top), Math.round(r.bottom), getComputedStyle(el).overflow]);
    }
  }
  return {max:document.documentElement.scrollHeight-window.innerHeight, bodyH:document.body.getBoundingClientRect().height,
          pageH:document.querySelector(".page-width").getBoundingClientRect().height, n:out.length, out:out.slice(0,10)};
}).then(x=>JSON.stringify(x,null,1)));
await browser.close();
