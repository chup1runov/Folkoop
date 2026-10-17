"""Upgrade a populated, same-version offline shell without deleting user data."""
import asyncio, os, threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path('_site').resolve()
phase={'old':True,'unavailable':False}
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def do_GET(self):
  if phase['unavailable']:
   self.send_error(503);return
  name=self.path.split('?')[0].lstrip('/') or 'index.html'
  path=(ROOT/name).resolve()
  if not path.is_relative_to(ROOT) or not path.is_file():
   self.send_error(404);return
  data=path.read_bytes()
  if phase['old'] and name=='sw.js':
   # Reproduce the former release-number-only cache key.
   data=data.replace(b"const CACHE=PREFIX+VERSION+':'+BUILD_ID;",b'const CACHE=PREFIX+VERSION;')
  if phase['old'] and name=='folkoop.js':
   data+=b"\ndocument.documentElement.dataset.cacheFixture='old';"
  self.send_response(200)
  self.send_header('Content-Type','application/javascript' if name.endswith('.js') else 'text/css' if name.endswith('.css') else 'text/html' if name.endswith('.html') else 'application/octet-stream')
  self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)

async def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/'
 try:
  async with async_playwright() as pw:
   browser=await getattr(pw,os.getenv('BROWSER_ENGINE','chromium')).launch()
   page=await browser.new_page()
   await page.goto(base+'?intro=0')
   await page.wait_for_function('() => navigator.serviceWorker.controller !== null')
   await page.evaluate("localStorage.setItem('mura-cache-test-draft','keep me');sessionStorage.setItem('folkoop-entry-mode-v1','guest')")
   await page.reload()
   await page.wait_for_function("() => document.documentElement.dataset.cacheFixture==='old'")
   phase['old']=False
   await page.reload()
   # The old shell loads once, then the registration lifecycle activates the
   # new worker and reloads it. No cache/storage-clearing APIs are used.
   try:
    await page.wait_for_function("() => !!document.querySelector('#folkoopGuideActor') && !document.documentElement.dataset.cacheFixture",timeout=30000)
   except Exception:
    print(await page.evaluate("async()=>{const r=await navigator.serviceWorker.getRegistration();return {controller:!!navigator.serviceWorker.controller,active:r?.active?.state,waiting:r?.waiting?.state,installing:r?.installing?.state,keys:await caches.keys(),marker:document.documentElement.dataset.cacheFixture}}"),flush=True)
    raise
   assert await page.evaluate("localStorage.getItem('mura-cache-test-draft')")=='keep me'
   assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='guest'
   # WebKit's automation offline switch can fail internally during reload.
   # A 503 server exercises its cache fallback without claiming device offline QA.
   if os.getenv('BROWSER_ENGINE','chromium')=='webkit':phase['unavailable']=True
   else:await page.context.set_offline(True)
   await page.reload()
   await page.wait_for_function("() => !!document.querySelector('#folkoopGuideActor') && !document.documentElement.dataset.cacheFixture")
   assert await page.evaluate("localStorage.getItem('mura-cache-test-draft')")=='keep me'
   await browser.close()
   print('PASS same-version cache upgrade, preserved draft/session, cached shell with network unavailable')
 finally:server.shutdown();server.server_close()

asyncio.run(main())
