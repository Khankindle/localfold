import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
console.log(await page.evaluate(()=>{
  const el=document.querySelector("#canvasContainer");
  const out=[];
  for(const sheet of document.styleSheets){
    let rules; try{rules=sheet.cssRules}catch(e){continue}
    const walk=(list)=>{
      for(const r of list){
        if(r.cssRules){walk(r.cssRules);continue;}
        if(!r.selectorText) continue;
        if(!/canvasContainer/.test(r.selectorText)) continue;
        const bg=r.style.getPropertyValue("background")||r.style.getPropertyValue("background-color");
        const bc=r.style.getPropertyValue("border-color");
        const bi=r.style.getPropertyPriority("border");
        if(bg||bc) out.push([r.selectorText, bg, bc, bi]);
      }
    };
    walk(rules);
  }
  return out;
}).then(x=>JSON.stringify(x,null,1)));
await browser.close();
