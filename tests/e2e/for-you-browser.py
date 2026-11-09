"""Intent -> explicit membership -> own proposal -> continuation. Isolated API, no real posts."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
API='https://abcdefghijklmnopqrst.supabase.co'
UID='11111111-1111-4111-8111-111111111111'
OTHER='22222222-2222-4222-8222-222222222222'
PROJECT='33333333-3333-4333-8333-333333333333'
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width in [390,1366]:
   context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':width,'height':844},color_scheme='dark')
   await context.add_init_script("localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done')")
   state={'members':[],'updates':[],'inbox':[],'fail':False,'writes':[],'offline_catalogue':False,'fail_read':False}
   project={'id':PROJECT,'owner_id':OTHER,'kind':'project','title':'Практика шведского за чаем','description':'Предложим тему и встретимся','location_text':'Göteborg','status':'active','created_at':'2026-11-09T09:00:00Z'}
   async def routing(route):
    url=route.request.url
    if url.endswith('/network-config.js'):
     await route.fulfill(body='globalThis.FolkoopNetworkConfig='+json.dumps({'enabled':True,'url':API,'publishableKey':'sb_publishable_example_for_tests_only'})+';',content_type='application/javascript');return
    if not url.startswith(API):await route.continue_();return
    payload=route.request.post_data_json if route.request.post_data else {};result=[]
    if url.endswith('/verify'):result={'access_token':'synthetic-for-you','expires_in':3600}
    elif url.endswith('/user'):result={'id':UID}
    elif url.endswith('/fk_claim_first_pilot'):result=True
    elif '/fk_profiles?' in url:result=[{'id':UID,'name':'Synthetic participant','listed':True}] if 'id=eq.'+UID in url else [{'id':UID,'name':'Synthetic participant'},{'id':OTHER,'name':'Synthetic host'}]
    elif '/fk_cooperations?' in url:
     if state['offline_catalogue']:await route.fulfill(status=503,body='{}',content_type='application/json');return
     result=[project]
    elif '/fk_cooperation_members?' in url:result=state['members']
    elif '/fk_cooperation_updates?' in url:
     if state['fail_read']:await route.fulfill(status=503,body='{}',content_type='application/json');return
     result=state['updates']
    elif url.endswith('/rpc/fk_activity_inbox'):result=state['inbox']
    elif url.endswith('/rpc/fk_join_cooperation'):
     state['writes'].append(('join',payload));state['members']=[{'cooperation_id':PROJECT,'user_id':UID,'role':'member'}];result=True
    elif url.endswith('/rpc/fk_add_cooperation_update'):
     state['writes'].append(('proposal',payload))
     if state['fail']:await route.fulfill(status=500,body=json.dumps({'message':'TEST_FAILURE'}),content_type='application/json');return
     state['updates'].append({'id':'44444444-4444-4444-8444-444444444444','cooperation_id':PROJECT,'author_id':UID,'body':payload['p_body'],'created_at':'2026-11-09T10:00:00Z'});result=state['updates'][-1]['id']
    elif url.endswith('/rpc/fk_mark_cooperation_read'):
     state['inbox']=[];result=True
    headers={'access-control-expose-headers':'content-range'}
    if isinstance(result,list):headers['content-range']=f'0-{max(0,len(result)-1)}/{len(result)}'
    await route.fulfill(body=json.dumps(result),content_type='application/json',headers=headers)
   await context.route('**/*',routing)
   page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/me')
   await page.fill('#netLogin [name=email]','synthetic@example.test');await page.click('#netLogin [value=code]')
   await page.fill('#netLogin [name=code]','123456');await page.check('#netLogin [name=policyAccepted]');await page.click('#netLogin [value=verify]')
   await page.click('[data-for-you-wish=swedish]')
   await expect(page.locator('.for-you-card')).to_have_count(1)
   await expect(page.locator('.for-you-card')).to_contain_text('Практика шведского')
   assert state['writes']==[]
   await page.locator('.for-you').screenshot(path=str(OUT/f'for-you-{width}.png'))
   await page.click('.for-you-card [data-for-you-open]')
   await expect(page.locator('.for-you-journey')).to_contain_text('присоединись ниже')
   await expect(page.locator('#netForYouContribution')).to_have_count(0)
   await page.click('[data-coop=join]')
   await expect(page.locator('#netForYouContribution')).to_be_visible()
   text='Предлагаю обсудить покупки на рынке <пример>'
   await page.fill('#netForYouContribution textarea',text)
   state['fail']=True
   await page.click('#netForYouContribution button')
   await expect(page.locator('#netForYouContribution button')).to_be_enabled()
   await expect(page.locator('#netForYouContribution textarea')).to_have_value(text)
   await expect(page.locator('.for-you-journey')).not_to_contain_text('Твоё предложение в проекте')
   state['fail']=False;state['fail_read']=True
   await page.click('#netForYouContribution button')
   await expect(page.locator('.for-you-journey')).to_contain_text('данные устарели')
   await expect(page.locator('#netForYouContribution')).to_have_count(0)
   state['fail_read']=False
   await page.click('.for-you-journey [data-net=refresh]')
   await expect(page.locator('.for-you-result')).to_contain_text(text)
   await expect(page.locator('.for-you-journey')).to_contain_text('ещё не согласие')
   await expect(page.locator('#netForYouContribution')).to_have_count(0)
   assert [x[0] for x in state['writes']]==['join','proposal','proposal']
   await page.click('[data-for-you-back]')
   await expect(page.locator('.for-you')).to_be_visible()
   await expect(page.locator('.for-you-continuations')).to_have_count(0)
   # A later update from another actor, and the existing unread inbox record.
   state['updates'].append({'id':'55555555-5555-4555-8555-555555555555','cooperation_id':PROJECT,'author_id':OTHER,'body':'Добавим эту тему в обсуждение','created_at':'2026-11-09T11:00:00Z'})
   state['inbox']=[{'cooperation_id':PROJECT,'cooperation_kind':'project','cooperation_title':project['title'],'last_actor_id':OTHER,'last_event_type':'update_posted','last_activity_at':'2026-11-09T11:00:00Z','unread_count':1}]
   await page.click('.for-you [data-net=refresh]')
   await expect(page.locator('.for-you-continuations')).to_contain_text(project['title'])
   await page.click('.for-you-continuations button')
   await expect(page.locator('.for-you-journey')).to_contain_text('Добавим эту тему')
   await expect(page.locator('.for-you-progress [aria-current]')).to_have_text('Продолжение')
   await page.locator('.for-you-journey').screenshot(path=str(OUT/f'for-you-result-{width}.png'))
   await page.click('[data-for-you-back]')
   await expect(page.locator('.for-you-continuations')).to_have_count(0)
   state['offline_catalogue']=True
   await page.click('.for-you [data-net=refresh]')
   await expect(page.locator('.for-you')).to_contain_text('данные устарели')
   await expect(page.locator('.for-you-empty')).to_have_count(0)
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert errors==[],errors
   print(f'PASS {width}: intent, join, failure/draft, saved result, real-record continuation, read, partial data, geometry')
   await context.close()
  # Mura practice does not send requests, change membership or pretend that a real response arrived.
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844},color_scheme='dark')
  await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done')")
  writes=[]
  async def readonly(route):
   if route.request.method not in ['GET','HEAD']:writes.append(route.request.url);await route.abort()
   elif route.request.url.startswith(BASE):await route.continue_()
   else:await route.abort()
  await context.route('**/*',readonly)
  page=await context.new_page();await page.goto(BASE)
  await page.click('[data-entry=guest]');await page.click('[data-onboarding=skip]')
  await page.click('.for-you-demo > summary')
  await page.click('[data-for-you-wish=swedish]')
  await page.locator('[data-discovery=save]').first.click()
  await page.click('[data-discovery=saved]')
  await expect(page.locator('.for-you-card')).to_have_count(1)
  await expect(page.locator('[data-discovery=start]')).to_have_count(0)
  await expect(page.locator('.for-you-demo')).to_have_attribute('open','')
  await page.locator('.for-you-card [data-for-you-open]').first.click()
  await expect(page.locator('.for-you-journey')).to_contain_text('ничего не отправляется')
  await page.click('[data-for-you-sample="1"]');await expect(page.locator('.for-you-result')).to_contain_text('Предлагаю вместе')
  await page.click('[data-for-you-sample="2"]');await expect(page.locator('.for-you-journey')).to_contain_text('Пример: участник ответил')
  await page.click('[data-for-you-back]');await expect(page.locator('.for-you-demo')).to_have_attribute('open','')
  assert writes==[],writes
  print('PASS Mura local example, continuation, return and zero writes')
  await context.close();await browser.close()
asyncio.run(main())
