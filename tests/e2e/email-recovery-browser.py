"""Synthetic local email callback; all non-local traffic intercepted, no email sent."""
import asyncio,json,os
from playwright.async_api import async_playwright,expect
BASE='http://localhost:4490/'
UID='11111111-1111-4111-8111-111111111111'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'))
  for width in [1366,390]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block')
   await ctx.add_init_script("sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');")
   state={'identity':0,'posts':[],'otp':0,'terminal':False}
   async def route(r):
    url=r.request.url
    if '/auth/v1/user' in url:
     state['identity']+=1
     return await r.fulfill(status=503 if state['identity']==1 else 200,content_type='application/json',body=json.dumps({'id':UID,'email':'synthetic@example.test','email_confirmed_at':'2026-01-01'}))
    if '/auth/v1/otp' in url:
     state['otp']+=1
     return await r.fulfill(status=429,content_type='application/json',body='{"code":"over_email_send_rate_limit"}')
    if url.startswith(BASE+'api/network/session') and r.request.method=='POST':
     state['posts'].append(r.request.post_data_json)
     if state['terminal']:return await r.fulfill(status=401,content_type='application/json',body='{"message":"AUTH_REQUIRED"}')
     if len(state['posts'])==1:return await r.fulfill(status=503,content_type='application/json',body='{"message":"SESSION_UNAVAILABLE"}')
    if url.startswith(BASE):return await r.continue_()
    await r.abort()
   await ctx.route('**/*',route)
   p=await ctx.new_page()
   callback=BASE+'#access_token=synthetic-access-token-long&refresh_token=synthetic-refresh&expires_in=3600&token_type=bearer&type=magiclink'
   await p.goto(callback)
   await expect(p.locator('#netStatus')).to_contain_text('temporarily unavailable')
   await p.locator('[data-email-link-retry]').click()
   await expect(p.locator('#netEmailLink')).to_be_visible()
   await p.locator('#netEmailLink input[type=checkbox]').check()
   await p.locator('#netEmailLink button').click()
   await expect(p.locator('#netStatus')).to_contain_text('temporarily unavailable')
   await p.locator('#netEmailLink input[type=checkbox]').check()
   await p.locator('#netEmailLink button').click()
   await expect(p.locator('#netProfile input[name=name]')).to_have_value('Synthetic session person')
   assert state['posts'][0]==state['posts'][1]
   assert state['otp']==0
   assert 'synthetic-refresh' not in await p.evaluate('JSON.stringify(localStorage)+JSON.stringify(sessionStorage)')
   await p.reload()
   await expect(p.locator('#netProfile input[name=name]')).to_have_value('Synthetic session person')
   other=await ctx.new_page();await other.goto(BASE+'?intro=0#/me')
   await expect(other.locator('#netProfile input[name=name]')).to_have_value('Synthetic session person')
   # Explicitly rejected callback clears the form and offers another account/new link.
   state['terminal']=True
   await p.goto(callback)
   await p.locator('#netEmailLink input[type=checkbox]').check();await p.locator('#netEmailLink button').click()
   await expect(p.locator('.pilot-login-shell')).to_contain_text('invalid or expired')
   await expect(p.locator('#netEmailLink')).to_have_count(0)
   await p.locator('[data-email-link-cancel]').click()
   # Logout synthetic session, then verify the rate-limit message without email delivery.
   await p.evaluate("async()=>{const c=FolkoopNetwork.client(FolkoopNetworkConfig);await c.restore();await c.logout();}")
   await p.reload();await p.locator('#netLogin input[name=email]').fill('synthetic@example.test')
   await p.locator('#netLogin button').click()
   await expect(p.locator('#netStatus')).to_contain_text('reset time is unknown')
   assert state['otp']==1
   print(f'PASS {width}px: identity retry, session retry, reload, new tab, rejected link, email limit; no external traffic')
   await ctx.close()
  await browser.close()
asyncio.run(main())
