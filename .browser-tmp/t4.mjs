import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
for (const [w,h] of [[1920,1080],[1280,720],[768,1024],[414,896]]) {
  const page = await browser.newPage();
  await page.setViewport({width:w,height:h});
  await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2200));
  const out = await page.evaluate(()=>{
    const tools=[...document.querySelectorAll("#viewer-toolbar .tool")];
    return {toolbarW: document.querySelector("#viewer-toolbar").getBoundingClientRect().width|0,
      labelsVisible: tools.map(t=>{const l=t.querySelector(".tool-label");return l?getComputedStyle(l).display!=="none":null;}).filter(x=>x!==null),
      wrapped: tools.filter(t=>t.scrollHeight>t.clientHeight+1).map(t=>t.id),
      names: tools.map(t=>t.getAttribute("aria-label")||t.textContent.trim()),
      overflow: document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  console.log(w+"x"+h, JSON.stringify(out));
  await page.close();
}
await browser.close();
