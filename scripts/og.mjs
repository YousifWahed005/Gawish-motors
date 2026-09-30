import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  reducedMotion: "reduce",
});
await page.goto(process.env.VERIFY_URL || "http://localhost:3000");
await page
  .locator("img")
  .evaluateAll((images) => images.forEach((img) => (img.loading = "eager")));
await page.waitForLoadState("networkidle");
const content=JSON.parse(await readFile("data/content.json","utf8")).en;
await page.evaluate(c=>{
  const font=getComputedStyle(document.body).fontFamily;
  document.body.replaceChildren();
  Object.assign(document.body.style,{margin:"0",background:"#090909",color:"#ffd0d2",fontFamily:font,width:"1200px",height:"630px",position:"relative",overflow:"hidden"});
  const photo=document.createElement("img");photo.src=c.hero.image;Object.assign(photo.style,{position:"absolute",right:"0",top:"120px",width:"660px",height:"450px",objectFit:"cover"});document.body.append(photo);
  const panel=document.createElement("div");Object.assign(panel.style,{position:"absolute",left:"0",top:"0",padding:"55px 50px",width:"570px",height:"630px",background:"#090909"});document.body.append(panel);
  const brand=document.createElement("div");brand.textContent=c.brand.name.toUpperCase();Object.assign(brand.style,{fontSize:"25px",fontWeight:"700",marginBottom:"70px",color:"#ffd0d2"});panel.append(brand);
  const eyebrow=document.createElement("p");eyebrow.textContent=c.hero.eyebrow;Object.assign(eyebrow.style,{fontSize:"12px",letterSpacing:"1px",margin:"0 0 24px"});panel.append(eyebrow);
  const heading=document.createElement("div");heading.textContent=c.hero.title;Object.assign(heading.style,{fontSize:"64px",fontWeight:"700",lineHeight:"1.05",letterSpacing:"-3px"});panel.append(heading);
  const accent=document.createElement("div");accent.textContent=c.hero.accent;Object.assign(accent.style,{fontSize:"64px",fontWeight:"700",lineHeight:"1.05",letterSpacing:"-3px",color:"#ff343b",marginTop:"12px"});panel.append(accent);
  const tagline=document.createElement("p");tagline.textContent=c.brand.tagline;Object.assign(tagline.style,{fontSize:"18px",marginTop:"38px",maxWidth:"400px"});panel.append(tagline);
},content);
await page.waitForFunction(()=>Array.from(document.images).every(img=>img.complete&&img.naturalWidth>0));
await page.screenshot({ path: "public/images/og.png" });
await browser.close();
