import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
for (const [w,h] of [[1280,720],[1366,768],[1536,864],[1920,1080],[1100,720],[768,900],[414,800]]){
  const page = await browser.newPage();
  await page.setViewport({width:w,height:h});
  const errs=[]; page.on("pageerror",e=>errs.push(e.message));
  await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2200));
  const empty = await page.evaluate(()=>({
    docH:document.documentElement.scrollHeight, winH:window.innerHeight,
    maxScroll:Math.max(0,document.documentElement.scrollHeight-window.innerHeight),
    overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  await (await page.$("#file-upload")).uploadFile("/home/user/localfold/tools/fixtures/1brs-crystal.pdb");
  await new Promise(r=>setTimeout(r,3500));
  const loaded = await page.evaluate(()=>{
    const over=[];
    for(const el of document.querySelectorAll("*")){
      const r=el.getBoundingClientRect();
      if(r.width===0||r.height===0) continue;
      if(r.right>document.documentElement.clientWidth+1 || r.left<-1)
        over.push([el.id||el.className||el.tagName, Math.round(r.left), Math.round(r.right)]);
    }
    return {over:over.slice(0,6), docH:document.documentElement.scrollHeight, winH:window.innerHeight,
      toolbarRows:[...document.querySelectorAll("#viewer-toolbar .tool")].filter(t=>t.getBoundingClientRect().height>40).length};
  });
  // dark flip
  await page.click("#theme-toggle");
  await new Promise(r=>setTimeout(r,500));
  const dark = await page.evaluate(()=>({theme:document.documentElement.dataset.theme,
    bg:getComputedStyle(document.body).backgroundColor,
    bodyClass:document.body.className}));
  console.log(w+"x"+h, JSON.stringify(empty), JSON.stringify(loaded), JSON.stringify(dark), errs.length?JSON.stringify(errs):"");
  await page.close();
}
await browser.close();
