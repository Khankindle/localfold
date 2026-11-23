import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,6000));
const flat = await page.evaluate(()=>{
  const c=document.querySelector("#canvas");
  const off=document.createElement("canvas"); off.width=c.width; off.height=c.height;
  const ctx=off.getContext("2d"); ctx.drawImage(c,0,0);
  const d=ctx.getImageData(0,0,off.width,off.height).data;
  const seen=new Set(); let opaque=0;
  for(let i=0;i<d.length;i+=4){ if(d[i+3]>8){opaque++; seen.add((d[i]>>3)+","+(d[i+1]>>3)+","+(d[i+2]>>3));} }
  return {w:c.width,h:c.height,distinct:seen.size,opaque};
});
console.log("PIXELS",JSON.stringify(flat));
console.log("scrollY", await page.evaluate(()=>window.scrollY));
await browser.close();
