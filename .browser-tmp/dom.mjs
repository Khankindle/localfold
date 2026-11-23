import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
const pre = await page.evaluate(()=>({
  slots: document.querySelectorAll(".py2dmol-slot").length,
  slotTabs: document.querySelectorAll(".py2dmol-slot-tab").length,
  fsBtn: document.querySelectorAll(".py2dmol-fs-btn").length,
  nav: !!document.querySelector("#navigationControls"),
  navRect: (()=>{const r=document.querySelector("#navigationControls")?.getBoundingClientRect();return r&&[r.x|0,r.y|0,r.width|0,r.height|0];})(),
  heatChildren: document.querySelector("#heatmapContainer")?.children.length,
  scatterDups: document.querySelectorAll("#scatterContainer").length,
}));
console.log("PRE", JSON.stringify(pre,null,1));
await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,6000));
const post = await page.evaluate(()=>{
  const h=document.querySelector("#heatmapContainer");
  return {
    slots: document.querySelectorAll(".py2dmol-slot").length,
    slotTabs: document.querySelectorAll(".py2dmol-slot-tab").length,
    fsBtn: document.querySelectorAll(".py2dmol-fs-btn").length,
    heatHTML: h ? h.outerHTML.slice(0,1200) : null,
    rpChildren: [...document.querySelector("#rightPanelsContainer").children].map(e=>e.id||e.className),
    rightPanelChildren: [...document.querySelector("#rightPanelContainer").children].map(e=>e.id||e.className),
  };
});
console.log("POST", JSON.stringify(post,null,1));
await browser.close();
