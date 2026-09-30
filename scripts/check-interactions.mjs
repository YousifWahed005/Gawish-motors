import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({reducedMotion:'no-preference'});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.VERIFY_URL||'http://localhost:3000';
try{
 await page.goto(base);await page.waitForLoadState('networkidle');
 await page.locator('.theme-toggle').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.locator('.language-switch').click();
 await page.locator('.theme-toggle').click();
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.reload();await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.waitForFunction(()=>document.querySelectorAll('.reveal-pending').length>0);
 await page.locator('#services').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>!document.querySelector('#services [data-reveal]')?.classList.contains('reveal-pending'));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelectorAll('.reveal-pending').length===0);
 assert.deepEqual(errors,[]);console.log('PASS: navigation, theme interaction/persistence, scroll reveals, reduced-motion preference changes');
}finally{await browser.close()}
