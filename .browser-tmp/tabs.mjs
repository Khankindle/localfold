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
const state = () => page.evaluate(()=>{
  const pages=[...document.querySelectorAll(".result-page")].map(p=>[p.id,p.hidden?"hidden":"shown",getComputedStyle(p).display]);
  const box=id=>{const e=document.getElementById(id);return e?{hidden:e.hidden,display:getComputedStyle(e).display}:null};
  return {theme:document.documentElement.dataset.theme, pages,
    downloads:box("downloads"), mapEmpty:box("mapEmpty"), heatmap:box("heatmapContainer"),
    plddt:box("plddtContainer"), summary:document.querySelector("#predictionScoresBox")?.textContent.slice(0,60),
    selected:[...document.querySelectorAll('[role="tab"][aria-selected="true"]')].map(t=>t.textContent)};
});
console.log("tabs light:", JSON.stringify(await state()));
// click each results tab
for(const name of ["Summary","pLDDT","Map","Scatter"]){
  await page.click(`#results-tabs [data-tab="${name.toLowerCase()}"]`).catch(async()=>{
    await page.evaluate((n)=>{const t=[...document.querySelectorAll('#results-tabs [role="tab"]')].find(b=>b.textContent.trim().toLowerCase()===n);t&&t.click();}, name.toLowerCase());
  });
  await new Promise(r=>setTimeout(r,300));
  console.log(name, JSON.stringify(await state()));
}
await page.screenshot({path:"/tmp/tabs-light.png"});
await page.click("#theme-toggle");
await new Promise(r=>setTimeout(r,800));
await page.screenshot({path:"/tmp/tabs-dark.png"});
console.log("dark:", JSON.stringify(await state()));
await browser.close();
