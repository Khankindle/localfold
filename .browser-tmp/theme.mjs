import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("pageerror",e=>console.log("[e]",e.message));
page.on("console",m=>{if(m.type()==="error")console.log("[c]",m.text().slice(0,160));});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,5000));
const snap = () => page.evaluate(()=>{
  const cs=(el)=>el?getComputedStyle(el):null;
  return {theme:document.documentElement.dataset.theme,
    toggleLabel:document.querySelector("#theme-toggle")?.getAttribute("aria-label"),
    icon:document.querySelector("#theme-toggle i")?.className,
    bodyBg:getComputedStyle(document.body).backgroundColor,
    panelBg:cs(document.querySelector("#rightPanelContainer"))?.backgroundColor,
    canvasInline:document.querySelector("#canvas").style.background,
    containerBg:cs(document.querySelector("#canvasContainer")).backgroundColor,
    toolbarChip:cs(document.querySelector("#viewer-toolbar .tool > span")).backgroundColor,
    model:document.querySelector("#model-family")?.value,
    status:document.querySelector("#status-message")?.textContent};
});
console.log("light", JSON.stringify(await snap()));
await page.click("#theme-toggle");
await new Promise(r=>setTimeout(r,900));
console.log("dark ", JSON.stringify(await snap()));
// results preserved?
console.log("preserved", await page.evaluate(()=>({objects:Object.keys((window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer?.objectsData||{}), model:document.querySelector("#model-family")?.value})));
await page.screenshot({path:"/tmp/dark.png"});
await page.click("#theme-toggle");
await new Promise(r=>setTimeout(r,900));
console.log("back ", JSON.stringify(await snap()));
await page.screenshot({path:"/tmp/light.png"});
await browser.close();
