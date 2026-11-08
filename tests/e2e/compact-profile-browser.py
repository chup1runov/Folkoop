"""Compact profile/settings UI. Isolated synthetic API; real permission checks live in network-public-pages.sql."""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
UID='11111111-1111-4111-8111-111111111111'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome'))
  for width in [390,1366]:
   c=await browser.new_context(viewport={'width':width,'height':844},service_workers='block',locale='ru-RU')
   await c.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
   async def offline(r):
    if r.request.url.startswith(BASE): await r.continue_()
    else: await r.abort()
   await c.route('**/*',offline)
   p=await c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   await p.goto(BASE);await p.locator('[data-entry="guest"]').click();await p.get_by_role('button',name='Осмотреться самому',exact=True).click()
   await expect(p.locator('.demo-profile-card')).to_be_visible()
   assert await p.locator('#mobileContextDock a').all_text_contents()==['Профиль','Настройки']
   await expect(p.locator('#muraEntryTitle')).to_be_visible()
   assert await p.locator('.compact-section[open]').count()==0
   await p.screenshot(path=str(OUT/f'profile-{width}.png'),full_page=True)
   await p.locator('.mura-entry-story summary').click();await p.get_by_role('button',name='Открыть закупку',exact=True).click()
   await expect(p.locator('#networkPanel')).to_contain_text('Купить сухие дрова вместе')
   await p.goto(BASE+'#/settings');await p.locator('#appearanceTheme').select_option('dark')
   await expect(p.locator('html')).to_have_attribute('data-theme','dark')
   await p.locator('#appearanceMotion').check();await p.reload()
   await expect(p.locator('#appearanceTheme')).to_have_value('dark');await expect(p.locator('#appearanceMotion')).to_be_checked()
   await p.screenshot(path=str(OUT/f'settings-{width}.png'),full_page=True)
   assert await p.locator('#netLogin:visible').count()==0
   for route in ['home','me','together','projects','settings']:
    await p.goto(BASE+'#/'+route);await expect(p.locator('#mobilePrimaryNav')).to_be_visible()
    assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,route)
   assert not errors,errors
   await c.close()
  c=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  await c.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-onboarding-v3','done');sessionStorage.setItem('folkoop-entry-mode-v1','account');")
  state={'revision':0,'published':False,'content':{},'visible':[]};published=[];writes=[]
  async def api(r):
   nonlocal state,published
   url=r.request.url
   if url.endswith('/network-config.js'):
    await r.fulfill(content_type='text/javascript',body="globalThis.FolkoopNetworkConfig={enabled:true,serverSession:true,url:'https://abcdefghijklmnopqrst.supabase.co',publishableKey:'sb_publishable_example_for_tests_only'}");return
   if '/api/network/session' in url: result={'id':UID,'expiresAt':4102444800000}
   elif '/rpc/fk_my_public_page' in url: result=state
   elif '/rpc/fk_save_public_page' in url:
    v=r.request.post_data_json;writes.append(v);state={'revision':v['p_revision']+1,'published':v['p_published'],'content':v['p_content'],'visible':v['p_visible']};published=[{'id':UID,'content':{k:v['p_content'][k] for k in v['p_visible']}}] if v['p_published'] else [];result=None
   elif '/rest/v1/fk_public_pages?' in url:
    assert 'authorization' not in r.request.headers;result=published
   elif '/rest/v1/fk_profiles?' in url: result=[{'id':UID,'name':'QA owner','skills':'Private skills','about':'Private biography','listed':False}]
   elif '/api/network/' in url:result=[]
   elif url.startswith(BASE):await r.continue_();return
   else:await r.abort();return
   await r.fulfill(content_type='application/json',body=json.dumps(result))
  await c.route('**/*',api);p=await c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  await p.goto(BASE+'#/me');await p.locator('.public-profile-editor>summary').click()
  f=p.locator('#netPublicProfile');await f.locator('[name="name"]').fill('QA public alias');await f.locator('[name="ideas"]').fill('PRIVATE IDEA');await f.locator('[name="visible"][value="name"]').check();await f.locator('[name="published"]').check()
  await f.locator('.public-preview>summary').click();await expect(f.locator('[data-public-preview]')).not_to_contain_text('PRIVATE IDEA')
  await f.locator('button').click();await expect(p.locator('.public-profile-editor>summary')).to_contain_text('Опубликована');assert len(writes)==1
  q=await c.new_page();await q.goto(BASE+'person.html?id='+UID+'&lang=ru');await expect(q.locator('#publicPerson')).to_contain_text('QA public alias');await expect(q.locator('#publicPerson')).not_to_contain_text('PRIVATE');assert await q.locator('#netLogin').count()==0
  await q.reload();await expect(q.locator('#publicPerson')).to_contain_text('QA public alias')
  await expect(p.locator('.public-profile-editor')).to_have_attribute('open','')
  await p.locator('#netPublicProfile [name="published"]').uncheck();await p.locator('#netPublicProfile button').click();await expect(p.locator('.public-profile-editor>summary')).to_contain_text('Не опубликована')
  await q.reload();await expect(q.locator('#publicPerson')).to_contain_text('Страница недоступна');assert not errors,errors
  await browser.close()
 print('PASS: 390/1366 compact Mura, purchase link, settings persistence, no overflow; synthetic owner publication/preview, anonymous read, reload, unpublish. SQL permission checks are separate.')
asyncio.run(main())
