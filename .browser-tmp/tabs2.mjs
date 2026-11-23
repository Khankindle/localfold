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
for(const name of ["summary","plddt","pae","contact"]){
  await page.evaluate((n)=>{document.querySelector(`#results-tabs [data-results-tab="${n}"]`).click();}, name);
  await new Promise(r=>setTimeout(r,350));
  console.log(name, await page.evaluate(()=>{
    const pages=[...document.querySelectorAll(".result-page")].map(p=>`${p.id}:${p.hidden?"hidden":getComputedStyle(p).display}`);
    const box=id=>{const e=document.getElementById(id);return `${id}:${e?(e.style.display||"auto"):"?"}`};
    const sel=document.querySelector('#results-tabs [role="tab"][aria-selected="true"]')?.textContent;
    return JSON.stringify({sel,pages,heat:box("heatmapContainer"),empty:document.getElementById("mapEmpty").hidden});
  }));
}
await browser.close();
