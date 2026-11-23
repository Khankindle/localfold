import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:1280,height:720});
page.on("console", m=>console.log("[c]",m.type(),m.text().slice(0,200)));
page.on("pageerror", e=>console.log("[e]",e.message));
await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
const input = await page.$("#file-upload");
await input.uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
await new Promise(r=>setTimeout(r,6000));
const s = await page.evaluate(()=>({
 status: document.querySelector("#status-message")?.textContent,
 objects: Object.keys((window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer?.objectsData||{}),
 frames: Object.values((window.py2dmol_viewers||{})[Object.keys(window.py2dmol_viewers||{})[0]]?.renderer?.objectsData||{}).map(o=>o.frames?.length),
 canvas:[document.querySelector("#canvas").width,document.querySelector("#canvas").height],
 scrollY: window.scrollY,
}));
console.log(JSON.stringify(s,null,1));
await browser.close();
