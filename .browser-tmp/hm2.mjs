import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("pageerror",e=>console.log("[e]",e.message));
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
const before = () => page.evaluate(()=>{
  const reg=(window.py2dmol_viewers||{}); const k=Object.keys(reg)[0];
  const hm=reg[k]?.renderer?.heatmapRenderer;
  return hm?{ctor:hm.constructor.name, proto:Object.getPrototypeOf(hm).constructor.name,
    own:Object.keys(hm), maps:Object.keys(hm.maps||{}), mapKey:hm.mapKey, bytes:hm.bytes?hm.bytes.length:null}
    :null;
});
console.log("before", JSON.stringify(await before()));
// push a synthetic contact map exactly like showTrunkContacts does
const res = await page.evaluate(()=>{
  const reg=(window.py2dmol_viewers||{}); const k=Object.keys(reg)[0]; const renderer=reg[k].renderer;
  const n=64; const data=new Uint8Array(n*n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){data[y*n+x]=Math.max(0,255-Math.abs(x-y)*9);}
  renderer.chains=[n];
  renderer.heatmapRenderer.setMaps({contact:{data,n,vmin:0,vmax:1,chains:[n]}});
  window.Heatmap?.updateVisibility?.(renderer);
  renderer.render("probe");
  const hm=renderer.heatmapRenderer;
  return {maps:Object.keys(hm.maps||{}),mapKey:hm.mapKey,bytes:hm.bytes?.length,scale:hm.scale&&Object.keys(hm.scale),
    container:document.getElementById("heatmapContainer").style.display,
    wrap:document.getElementById("heatmapWrap")?"yes":"no"};
});
console.log("after setMaps", JSON.stringify(res));
await page.evaluate(()=>document.querySelector('#results-tabs [data-results-tab="contact"]').click());
await new Promise(r=>setTimeout(r,400));
console.log("tab", await page.evaluate(()=>{
  const r=(window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers)[0]].renderer;
  const hm=r.heatmapRenderer;
  const bar=document.getElementById("mapColourBar");
  return JSON.stringify({container:document.getElementById("heatmapContainer").style.display,
    mapKey:hm.mapKey, baseCanvas:!!hm.baseCanvas, rampType:typeof hm.scale.ramp,
    barHidden:bar.hidden, barMin:document.getElementById("mapBarMin").textContent,
    barMax:document.getElementById("mapBarMax").textContent,
    barBg:document.getElementById("mapBarTrack").style.background.slice(0,60)});
}));
// flip theme and see whether the ramp actually changes pixels
const px = async()=>page.evaluate(()=>{
  const c=document.getElementById("heatmapCanvas");
  const ctx=c.getContext("2d");
  const d=ctx.getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data;
  return Array.from(d);
});
console.log("px light", JSON.stringify(await px()));
await page.click("#theme-toggle");
await new Promise(r=>setTimeout(r,900));
console.log("px dark ", JSON.stringify(await px()));
console.log("bar dark", await page.evaluate(()=>JSON.stringify({hidden:document.getElementById("mapColourBar").hidden,
  bg:document.getElementById("mapBarTrack").style.background.slice(0,70)})));
await page.screenshot({path:"/tmp/map-dark.png"});
await browser.close();
