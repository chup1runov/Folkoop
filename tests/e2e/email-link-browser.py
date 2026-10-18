"""Browser contract only: mocked Auth, no real identity/consent claims."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4186/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
TOKEN='synthetic-email-link-token-not-a-credential'
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if ENGINE=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',viewport={'width':390,'height':844})
  await context.add_init_script("localStorage.setItem('folkoop-language','ru');")
  claims=[];logout_scopes=[]
  async def route(r):
   url=r.request.url
   if '.supabase.co/' not in url:await r.continue_();return
   if url.endswith('/user'):result={'id':'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','email':'synthetic@example.test','email_confirmed_at':'2026-10-18T10:00:00Z'}
   elif url.endswith('/fk_claim_pilot_invite'):claims.append(r.request.post_data_json);result=True
   elif '/logout?scope=' in url:logout_scopes.append(url.split('scope=')[1]);result=None
   else:result=[]
   await r.fulfill(body=json.dumps(result),content_type='application/json',headers={'content-range':'*/0'})
  await context.route('**/*',route)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#access_token='+TOKEN+'&refresh_token=discard-this&expires_in=3600&token_type=bearer&type=magiclink')
  await expect(page.locator('#netEmailLink')).to_be_visible()
  assert 'access_token' not in page.url and 'refresh_token' not in page.url
  await expect(page.locator('#networkPanel')).to_contain_text('synthetic@example.test')
  assert not claims
  await page.locator('#netEmailLink button').click()
  await expect(page.locator('#netStatus')).to_contain_text('условия')
  assert not claims
  await page.locator('#netEmailLink [name=policyAccepted]').check()
  await page.locator('#netEmailLink [name=inviteCode]').fill('SYNTHETIC-INVITE')
  await page.locator('#netEmailLink button').click()
  await expect(page.locator('#netProfile')).to_be_visible()
  assert len(claims)==1 and claims[0]['p_accept_terms'] is True
  async with page.expect_download() as exported:
   await page.locator('[data-net=export]').click()
  download=await exported.value
  exported_data=json.loads(Path(await download.path()).read_text())
  assert exported_data['manifest']['completeAccountExport'] is False
  assert len(exported_data['manifest']['sections'])==20
  await expect(page.locator('#networkExportReport')).to_contain_text('Это не полная копия аккаунта')
  assert TOKEN not in json.dumps(exported_data)
  await expect(page.locator('#networkExportReport a')).to_have_attribute('href','mailto:Chup1runov@gmail.com')
  assert not await page.evaluate("JSON.stringify({...localStorage,...sessionStorage}).includes('synthetic-email-link-token')")
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  await page.locator('[data-net=logoutAll]').click()
  await expect(page.locator('#netLogin')).to_be_visible()
  assert logout_scopes==['global']
  assert await page.locator('#networkExportReport').count()==0
  await page.reload()
  assert await page.locator('#netProfile').count()==0
  assert await page.locator('#networkExportReport').count()==0
  await page.close();page=await context.new_page()
  await page.goto(BASE+'#error=access_denied&error_description=secret')
  await expect(page.locator('#networkPanel')).to_contain_text('Ссылка недействительна')
  assert 'secret' not in page.url
  await page.locator('[data-email-link-cancel]').click()
  await expect(page.locator('#netLogin')).to_be_visible()
  await browser.close()
  print('PASS email-link identity, URL cleanup, explicit consent, no credential storage, reload and invalid link ('+ENGINE+')')
asyncio.run(main())
