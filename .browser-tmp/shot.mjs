import puppeteer from "puppeteer-core";
const [,,out,pdb,wait] = process.argv;
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
await page.setViewport({width:Number(process.env.W||1280),height:Number(process.env.H||720)});
page.on("pageerror",e=>console.log("[e]",e.message));
await page.goto(process.env.URL||"http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,3000));
if(pdb){ await (await page.$("#file-upload")).uploadFile(pdb); await new Promise(r=>setTimeout(r,Number(wait||6000))); }
await page.screenshot({path:out});
console.log("saved",out);
await browser.close();
