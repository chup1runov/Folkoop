"""CSP/XSS browser regression for FOLKOOP static shells."""
import asyncio, os, shutil
from playwright.async_api import async_playwright

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')

async def main():
 async with async_playwright() as pw:
  engine=os.getenv('BROWSER_ENGINE','chromium').lower()
  if engine=='webkit': browser=await pw.webkit.launch()
  else: browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block')
  page=await context.new_page()
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE)
  await page.wait_for_timeout(300)
  assert await page.locator('script:not([src])').count()==0,'main production shell must not require inline script execution'
  # Browser-enforced CSP must reject an injected inline script.
  ran=await page.evaluate("""() => {
    window.__folkoopXssProbe=0;
    const s=document.createElement('script');
    s.textContent='window.__folkoopXssProbe=1';
    document.head.appendChild(s);
    return new Promise(resolve=>setTimeout(()=>resolve(window.__folkoopXssProbe),50));
  }""")
  assert ran==0,'CSP allowed injected inline JavaScript'
  # Representative hostile user/server text must stay inert when rendered as text.
  inert=await page.evaluate("""() => {
    const host=document.createElement('div');document.body.appendChild(host);
    const payload='<img src=x onerror="window.__folkoopXssProbe=2"><script>window.__folkoopXssProbe=3<\\/script>';
    const p=document.createElement('p');p.textContent=payload;host.appendChild(p);
    return {value:window.__folkoopXssProbe,imgs:host.querySelectorAll('img').length,scripts:host.querySelectorAll('script').length,text:p.textContent};
  }""")
  assert inert['value']==0 and inert['imgs']==0 and inert['scripts']==0
  assert '<img' in inert['text'] and '<script>' in inert['text']
  await context.close()
  await browser.close()
  print('PASS CSP blocks injected inline JavaScript')
  print('PASS hostile markup remains inert text at safe DOM boundary')
  assert not errors,[e for e in errors if 'Content Security Policy' not in e]

asyncio.run(main())
