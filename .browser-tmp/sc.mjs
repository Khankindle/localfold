import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("pageerror",e=>console.log("[e]",e.message));
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,2500));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,4000));
console.log(await page.evaluate(()=>{
  const c=document.getElementById("scatterContainer");
  return JSON.stringify({display:getComputedStyle(c).display, rect:[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)], hasScatter:!!((window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers)[0]]?.renderer?.objectHasScatter())});
}));
// force scatter renderer on, like showEnsembleScatter
console.log(await page.evaluate(()=>{
  const reg=(window.py2dmol_viewers||{}); const r=reg[Object.keys(reg)[0]].renderer;
  r.objectsData[r.currentObjectName].frames.forEach(f=>{f.scatter=[Math.random(),Math.random()];});
  if(!r.scatterRenderer){
    const canvas=document.getElementById("scatterCanvas"); const box=canvas.parentElement;
    const side=document.getElementById("heatmapContainer").clientWidth||340;
    canvas.width=side*3; canvas.height=side*3; canvas.style.width=side+"px"; canvas.style.height=side+"px";
    r.setScatterRenderer(new window.ScatterPlotViewer(canvas,r));
  }
  r.updateScatterData(); r.updateScatterContainerVisibility();
  const c=document.getElementById("scatterContainer");
  return JSON.stringify({display:getComputedStyle(c).display, inline:c.getAttribute("style"),
    rect:[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)],
    y:Math.round(c.getBoundingClientRect().y), canvasW:document.getElementById("scatterCanvas").getBoundingClientRect().width});
}));
await new Promise(r=>setTimeout(r,600));
await page.screenshot({path:"/tmp/scatter.png"});
await browser.close();
