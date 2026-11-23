import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "/tmp/chromium", headless: true,
  args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--use-gl=swiftshader","--enable-unsafe-swiftshader"] });
for (const [w,h] of [[1280,720],[1366,768],[1536,864],[1920,1080]]) {
  const page = await browser.newPage();
  await page.setViewport({width:w,height:h});
  const errs=[]; page.on("pageerror",e=>errs.push(e.message));
  await page.goto("http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2500));
  const out = await page.evaluate(()=>{
    const tools=[...document.querySelectorAll("#viewer-toolbar .tool")];
    return {
      toolbarH: document.querySelector("#viewer-toolbar").getBoundingClientRect().height|0,
      wrapped: tools.filter(t=>t.scrollHeight>t.clientHeight+1).map(t=>t.id),
      spansWrapped: tools.filter(t=>{const s=t.querySelector("span");return s&&s.scrollHeight>s.clientHeight+1;}).map(t=>t.id),
      labels: tools.map(t=>[t.id,(t.querySelector(".tool-label")?.textContent||"").trim()]),
      canvas:[document.querySelector("#canvas").width,document.querySelector("#canvas").height],
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  console.log(w+"x"+h, JSON.stringify(out), errs.length?("ERR "+errs.join("|")):"");
  await page.close();
}
await browser.close();
